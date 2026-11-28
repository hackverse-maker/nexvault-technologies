'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  activityLogs,
  blogPosts,
  contactInquiries,
  contactInformation,
  designSettings,
  footerColumns,
  footerConfiguration,
  headerSettings,
  navigationItems,
  orders,
  pageVersions,
  pages,
  products,
  sections,
  services,
  socialMediaLinks,
  websiteSettings,
  whatsappNumbers,
  whatsappSettings,
} from '@/lib/db/schema'
import { getAdminSession } from '@/lib/auth/session'

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
}

function revalidateSite() {
  // Bust the Full Route Cache / ISR for every page so header/footer changes go live.
  revalidatePath('/', 'layout')
}

async function audit(action: string, entityType: string, entityId?: string, details: Record<string, unknown> = {}) {
  const session = await getAdminSession()
  if (!session) return
  await db.insert(activityLogs).values({
    adminUserId: session.adminUserId,
    action,
    entityType,
    entityId: entityId ?? null,
    details,
  })
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function optionalStr(formData: FormData, key: string): string | null {
  const value = str(formData, key)
  return value === '' ? null : value
}

// ---------- Pages ----------

export async function createPageAction(formData: FormData) {
  await requireAdmin()
  const slug = str(formData, 'slug').toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const title = str(formData, 'title')
  const status = str(formData, 'status') || 'draft'
  if (!slug || !title) return
  const [row] = await db
    .insert(pages)
    .values({
      slug,
      title,
      status: status as 'draft' | 'published' | 'archived',
      seoTitle: optionalStr(formData, 'seoTitle'),
      seoDescription: optionalStr(formData, 'seoDescription'),
      publishedAt: status === 'published' ? new Date() : null,
    })
    .returning({ id: pages.id })
  await audit('create', 'page', row?.id, { slug, title })
  revalidatePath('/admin/pages')
  revalidateSite()
}

export async function updatePageAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const slug = str(formData, 'slug')
  const status = str(formData, 'status') || undefined
  await db
    .update(pages)
    .set({
      title: str(formData, 'title') || undefined,
      slug: slug ? slug.toLowerCase().replace(/[^a-z0-9-/]/g, '-') : undefined,
      status: status as 'draft' | 'published' | 'archived' | undefined,
      seoTitle: optionalStr(formData, 'seoTitle'),
      seoDescription: optionalStr(formData, 'seoDescription'),
      ogImage: optionalStr(formData, 'ogImage'),
      publishedAt: status === 'published' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
  await audit('update', 'page', id, { slug: slug || undefined, status })
  revalidatePath('/admin/pages')
  revalidateSite()
  revalidatePath('/admin/seo')
  revalidatePath('/admin/sections')
  revalidateSite()
}

export async function deletePageAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const page = await db.query.pages.findFirst({ where: eq(pages.id, id) })
  if (!page) return

  // Navigation items must keep exactly one target — remove header/footer links
  // pointing at this page before deleting it (sections cascade automatically).
  await db.delete(navigationItems).where(eq(navigationItems.targetPageId, id))
  await db.delete(pages).where(eq(pages.id, id))
  await audit('delete', 'page', id, { slug: page.slug, title: page.title })
  revalidatePath('/admin/pages')
  revalidateSite()
  revalidatePath('/admin/sections')
  revalidateSite()
  revalidatePath('/admin/header')
  revalidatePath('/admin/footer')
}

export async function duplicatePageAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const page = await db.query.pages.findFirst({ where: eq(pages.id, id) })
  if (!page) return

  const pageSections = await db.query.sections.findMany({
    where: eq(sections.pageId, id),
    orderBy: (s, { asc }) => [asc(s.sortOrder)],
  })

  let copySlug = `${page.slug}-copy`
  for (let i = 2; ; i++) {
    const existing = await db.query.pages.findFirst({ where: eq(pages.slug, copySlug) })
    if (!existing) break
    copySlug = `${page.slug}-copy-${i}`
  }

  const [copy] = await db
    .insert(pages)
    .values({
      slug: copySlug,
      title: `${page.title} (Copy)`,
      status: 'draft',
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
    })
    .returning({ id: pages.id })

  if (copy && pageSections.length > 0) {
    await db.insert(sections).values(
      pageSections.map((s) => ({
        pageId: copy.id,
        sectionType: s.sectionType,
        content: s.content,
        sortOrder: s.sortOrder,
        isVisible: s.isVisible,
      })),
    )
  }

  await audit('duplicate', 'page', copy?.id, { sourceSlug: page.slug, copySlug })
  revalidatePath('/admin/pages')
  revalidateSite()
  revalidatePath('/admin/sections')
  revalidateSite()
}

// ---------- Sections ----------

export async function createSectionAction(formData: FormData) {
  await requireAdmin()
  const pageId = str(formData, 'pageId')
  const sectionType = str(formData, 'sectionType')
  if (!pageId || !sectionType) return

  let content: Record<string, unknown> = {}
  const rawContent = str(formData, 'content')
  if (rawContent) {
    try {
      const parsed = JSON.parse(rawContent)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) content = parsed
    } catch {
      // ignore invalid JSON — section is created with empty content
    }
  }

  const maxOrder = await db.query.sections.findMany({
    where: eq(sections.pageId, pageId),
    orderBy: (s, { desc }) => [desc(s.sortOrder)],
    limit: 1,
  })
  const sortOrder = (maxOrder[0]?.sortOrder ?? -1) + 1
  await db.insert(sections).values({ pageId, sectionType, sortOrder, content })
  await touchDraft(pageId)
  await audit('create', 'section', undefined, { pageId, sectionType })
  revalidatePath('/admin/sections')
  revalidateSite()
}

export async function updateSectionAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return

  let content: Record<string, unknown> | undefined
  const rawContent = str(formData, 'content')
  if (rawContent) {
    try {
      const parsed = JSON.parse(rawContent)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) content = parsed
    } catch {
      return
    }
  }

  await db
    .update(sections)
    .set({
      ...(content !== undefined ? { content } : {}),
      isVisible: str(formData, 'isVisible') !== 'false',
      updatedAt: new Date(),
    })
    .where(eq(sections.id, id))
  const pageId = await pageIdForSection(id)
  if (pageId) await touchDraft(pageId)
  await audit('update', 'section', id)
  revalidatePath('/admin/sections')
  revalidateSite()
}

export async function toggleSectionAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  const isVisible = str(formData, 'isVisible') === 'true'
  if (!id) return
  await db.update(sections).set({ isVisible, updatedAt: new Date() }).where(eq(sections.id, id))
  const pageId = await pageIdForSection(id)
  if (pageId) await touchDraft(pageId)
  await audit('toggle', 'section', id, { isVisible })
  revalidatePath('/admin/sections')
  revalidateSite()
}

export async function deleteSectionAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const pageId = await pageIdForSection(id)
  await db.delete(sections).where(eq(sections.id, id))
  if (pageId) await touchDraft(pageId)
  await audit('delete', 'section', id)
  revalidatePath('/admin/sections')
  revalidateSite()
}

// ---------- Object-arg variants for the visual section builder ----------

export async function createSectionObj(pageId: string, sectionType: string, content?: Record<string, unknown>) {
  await requireAdmin()
  if (!pageId || !sectionType) return { error: 'Missing page or type' }
  const maxOrder = await db.query.sections.findMany({
    where: eq(sections.pageId, pageId),
    orderBy: (s, { desc }) => [desc(s.sortOrder)],
    limit: 1,
  })
  const sortOrder = (maxOrder[0]?.sortOrder ?? -1) + 1
  const [row] = await db
    .insert(sections)
    .values({ pageId, sectionType, sortOrder, content: content ?? {} })
    .returning({ id: sections.id })
  await touchDraft(pageId)
  await audit('create', 'section', row?.id, { pageId, sectionType })
  revalidatePath('/admin/sections')
  revalidateSite()
  revalidatePath(`/admin/builder`)
  return { id: row?.id }
}

export async function updateSectionObj(id: string, content: Record<string, unknown>, isVisible: boolean) {
  await requireAdmin()
  if (!id) return { error: 'Missing section id' }
  await db.update(sections).set({ content, isVisible, updatedAt: new Date() }).where(eq(sections.id, id))
  const pageId = await pageIdForSection(id)
  if (pageId) await touchDraft(pageId)
  await audit('update', 'section', id)
  revalidatePath('/admin/sections')
  revalidateSite()
  revalidatePath('/admin/builder')
  return { ok: true }
}

export async function duplicateSectionObj(id: string) {
  await requireAdmin()
  if (!id) return { error: 'Missing section id' }
  const section = await db.query.sections.findFirst({ where: eq(sections.id, id) })
  if (!section) return { error: 'Section not found' }
  const maxOrder = await db.query.sections.findMany({
    where: eq(sections.pageId, section.pageId),
    orderBy: (s, { desc }) => [desc(s.sortOrder)],
    limit: 1,
  })
  const [row] = await db
    .insert(sections)
    .values({
      pageId: section.pageId,
      sectionType: section.sectionType,
      content: section.content,
      sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1,
      isVisible: section.isVisible,
    })
    .returning({ id: sections.id })
  await touchDraft(section.pageId)
  await audit('duplicate', 'section', row?.id, { sourceId: id })
  revalidatePath('/admin/sections')
  revalidateSite()
  revalidatePath('/admin/builder')
  return { id: row?.id }
}

export async function reorderSectionsObj(pageId: string, orderedIds: string[]) {
  await requireAdmin()
  if (!pageId || !Array.isArray(orderedIds)) return { error: 'Invalid reorder payload' }
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx.update(sections).set({ sortOrder: i, updatedAt: new Date() }).where(eq(sections.id, orderedIds[i]))
    }
  })
  await touchDraft(pageId)
  await audit('reorder', 'sections', pageId, { count: orderedIds.length })
  revalidatePath('/admin/sections')
  revalidateSite()
  revalidatePath('/admin/builder')
  return { ok: true }
}

export async function deleteSectionObj(id: string) {
  await requireAdmin()
  if (!id) return { error: 'Missing section id' }
  const pageId = await pageIdForSection(id)
  await db.delete(sections).where(eq(sections.id, id))
  if (pageId) await touchDraft(pageId)
  await audit('delete', 'section', id)
  revalidatePath('/admin/sections')
  revalidateSite()
  revalidatePath('/admin/builder')
  return { ok: true }
}

// ---------- Draft tracking & publish workflow ----------

async function touchDraft(pageId: string) {
  await db.update(pages).set({ draftSavedAt: new Date(), updatedAt: new Date() }).where(eq(pages.id, pageId))
}

async function pageIdForSection(sectionId: string): Promise<string | null> {
  const row = await db.query.sections.findFirst({ where: eq(sections.id, sectionId), columns: { pageId: true } })
  return row?.pageId ?? null
}

export type PublishResult = { ok: boolean; error?: string; version?: number }

/** Record that the draft was saved (sections already persist immediately). */
export async function saveDraftAction(pageId: string): Promise<PublishResult> {
  await requireAdmin()
  if (!pageId) return { ok: false, error: 'Missing page' }
  try {
    await touchDraft(pageId)
    await audit('save_draft', 'page', pageId)
    revalidatePath('/admin/builder')
    revalidatePath('/admin/preview')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the draft. Please try again.' }
  }
}

/** Snapshot the draft sections as the published version — no redeploy needed. */
export async function publishPageAction(pageId: string): Promise<PublishResult> {
  await requireAdmin()
  if (!pageId) return { ok: false, error: 'Missing page' }
  try {
    const page = await db.query.pages.findFirst({ where: eq(pages.id, pageId) })
    if (!page) return { ok: false, error: 'Page not found' }
    if (page.status === 'archived') return { ok: false, error: 'Archived pages cannot be published.' }

    const pageSections = await db.query.sections.findMany({
      where: eq(sections.pageId, pageId),
      orderBy: [asc(sections.sortOrder)],
    })
    const snapshot = pageSections.map((s) => ({
      id: s.id,
      sectionType: s.sectionType,
      content: s.content,
      sortOrder: s.sortOrder,
      isVisible: s.isVisible,
    }))

    const countRows = await db.query.pageVersions.findMany({
      where: eq(pageVersions.pageId, pageId),
      columns: { versionNumber: true },
    })
    const versionNumber = countRows.reduce((max, v) => Math.max(max, v.versionNumber), 0) + 1
    const now = new Date()

    await db.transaction(async (tx) => {
      await tx
        .update(pages)
        .set({
          publishedSnapshot: snapshot,
          publishedAt: now,
          draftSavedAt: now,
          status: 'published',
          updatedAt: now,
        })
        .where(eq(pages.id, pageId))
      await tx.insert(pageVersions).values({
        pageId,
        versionNumber,
        snapshot,
        createdBy: (await getAdminSession())?.email ?? null,
      })
    })

    await audit('publish', 'page', pageId, { slug: page.slug, version: versionNumber })
    revalidatePath(`/${page.slug}`)
    revalidatePath('/admin/builder')
    revalidatePath('/admin/pages')
    revalidatePath('/admin/preview')
    return { ok: true, version: versionNumber }
  } catch {
    return { ok: false, error: 'Publishing failed. Your draft is safe — please try again.' }
  }
}

/** Restore a previous published version into the DRAFT (live site unchanged until publish). */
export async function restoreVersionAction(pageId: string, versionId: string): Promise<PublishResult> {
  await requireAdmin()
  if (!pageId || !versionId) return { ok: false, error: 'Missing version' }
  try {
    const version = await db.query.pageVersions.findFirst({
      where: (v, { and, eq }) => and(eq(v.id, versionId), eq(v.pageId, pageId)),
    })
    if (!version) return { ok: false, error: 'Version not found' }
    const snapshot = Array.isArray(version.snapshot) ? version.snapshot : []

    await db.transaction(async (tx) => {
      await tx.delete(sections).where(eq(sections.pageId, pageId))
      for (const s of snapshot as { id?: string; sectionType: string; content: unknown; sortOrder: number; isVisible?: boolean }[]) {
        await tx.insert(sections).values({
          pageId,
          sectionType: s.sectionType,
          content: (s.content ?? {}) as Record<string, unknown>,
          sortOrder: s.sortOrder ?? 0,
          isVisible: s.isVisible !== false,
        })
      }
      await tx.update(pages).set({ draftSavedAt: new Date(), updatedAt: new Date() }).where(eq(pages.id, pageId))
    })

    await audit('restore_version', 'page', pageId, { version: version.versionNumber })
    revalidatePath('/admin/builder')
    revalidatePath('/admin/preview')
    revalidatePath('/admin/sections')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Restore failed. Please try again.' }
  }
}

/** Global publish — refresh all cached pages so global changes (header, footer, design, settings) go live. */
export async function publishGlobalsAction(): Promise<PublishResult> {
  await requireAdmin()
  try {
    await audit('publish_globals', 'site')
    revalidateSite()
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not refresh the site cache. Please try again.' }
  }
}

// ---------- Website settings / business info / footer ----------

export async function saveWebsiteSettingsAction(formData: FormData) {
  await requireAdmin()
  await db
    .insert(websiteSettings)
    .values({
      id: 1,
      companyName: str(formData, 'companyName') || 'NexVault Technologies',
      tagline: str(formData, 'tagline'),
      defaultSeoTitle: str(formData, 'defaultSeoTitle'),
      defaultSeoDescription: str(formData, 'defaultSeoDescription'),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: websiteSettings.id,
      set: {
        companyName: str(formData, 'companyName') || 'NexVault Technologies',
        tagline: str(formData, 'tagline'),
        defaultSeoTitle: str(formData, 'defaultSeoTitle'),
        defaultSeoDescription: str(formData, 'defaultSeoDescription'),
        updatedAt: new Date(),
      },
    })
  await audit('update', 'website_settings', '1')
  revalidatePath('/admin/settings')
  revalidatePath('/admin/business')
  revalidateSite()
}

export async function saveContactInfoAction(formData: FormData) {
  await requireAdmin()
  await db
    .insert(contactInformation)
    .values({
      id: 1,
      primaryPhone: str(formData, 'primaryPhone'),
      secondaryPhone: str(formData, 'secondaryPhone'),
      whatsappNumber: str(formData, 'whatsappNumber'),
      businessEmail: str(formData, 'businessEmail'),
      address: optionalStr(formData, 'address'),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: contactInformation.id,
      set: {
        primaryPhone: str(formData, 'primaryPhone'),
        secondaryPhone: str(formData, 'secondaryPhone'),
        whatsappNumber: str(formData, 'whatsappNumber'),
        businessEmail: str(formData, 'businessEmail'),
        address: optionalStr(formData, 'address'),
        updatedAt: new Date(),
      },
    })
  await audit('update', 'contact_information', '1')
  revalidatePath('/admin/business')
  revalidateSite()
}

export async function saveSocialLinkAction(formData: FormData) {
  await requireAdmin()
  const id = optionalStr(formData, 'id')
  const values = {
    platform: str(formData, 'platform').toLowerCase(),
    label: str(formData, 'label'),
    url: str(formData, 'url'),
    sortOrder: Number(formData.get('sortOrder') ?? 0) || 0,
    isVisible: str(formData, 'isVisible') === 'true',
    updatedAt: new Date(),
  }
  if (!values.platform || !values.label || !values.url) return
  if (id) {
    await db.update(socialMediaLinks).set(values).where(eq(socialMediaLinks.id, id))
    await audit('update', 'social_media_link', id)
  } else {
    await db.insert(socialMediaLinks).values(values)
    await audit('create', 'social_media_link')
  }
  revalidatePath('/admin/business')
  revalidatePath('/admin/footer')
  revalidateSite()
}

export async function deleteSocialLinkAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(socialMediaLinks).where(eq(socialMediaLinks.id, id))
  await audit('delete', 'social_media_link', id)
  revalidatePath('/admin/business')
  revalidatePath('/admin/footer')
  revalidateSite()
}

export async function saveFooterConfigAction(formData: FormData) {
  await requireAdmin()
  await db
    .insert(footerConfiguration)
    .values({
      id: 1,
      heading: str(formData, 'heading'),
      description: str(formData, 'description'),
      copyrightText: str(formData, 'copyrightText'),
      showSocialLinks: str(formData, 'showSocialLinks') === 'true',
      logoMediaId: optionalStr(formData, 'logoMediaId'),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: footerConfiguration.id,
      set: {
        heading: str(formData, 'heading'),
        description: str(formData, 'description'),
        copyrightText: str(formData, 'copyrightText'),
        showSocialLinks: str(formData, 'showSocialLinks') === 'true',
        logoMediaId: optionalStr(formData, 'logoMediaId'),
        updatedAt: new Date(),
      },
    })
  await audit('update', 'footer_configuration', '1')
  revalidatePath('/admin/footer')
  revalidateSite()
}

// ---------- Navigation (header/footer) ----------

export async function saveNavItemAction(formData: FormData) {
  await requireAdmin()
  const id = optionalStr(formData, 'id')
  const label = str(formData, 'label')
  const location = str(formData, 'location') === 'footer' ? 'footer' : 'header'
  const targetUrl = optionalStr(formData, 'targetUrl')
  const targetPageId = optionalStr(formData, 'targetPageId')
  const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0
  const footerColumnId = location === 'footer' ? optionalStr(formData, 'footerColumnId') : null
  if (!label || (!targetUrl && !targetPageId)) return

  const values = {
    label,
    location,
    targetUrl,
    targetPageId,
    footerColumnId,
    parentId: location === 'header' ? optionalStr(formData, 'parentId') : null,
    sortOrder,
    isVisible: str(formData, 'isVisible') !== 'false',
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(navigationItems).set(values).where(eq(navigationItems.id, id))
    await audit('update', 'navigation_item', id)
  } else {
    await db.insert(navigationItems).values(values)
    await audit('create', 'navigation_item', undefined, { label, location })
  }
  revalidatePath('/admin/header')
  revalidatePath('/admin/footer')
  revalidateSite()
}

export async function deleteNavItemAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(navigationItems).where(eq(navigationItems.id, id))
  await audit('delete', 'navigation_item', id)
  revalidatePath('/admin/header')
  revalidatePath('/admin/footer')
  revalidateSite()
}

export async function moveNavItemAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  const location = str(formData, 'location') === 'footer' ? 'footer' : 'header'
  const dir = str(formData, 'dir') === 'up' ? -1 : 1
  if (!id) return

  const siblings = await db.query.navigationItems.findMany({
    where: eq(navigationItems.location, location),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  })
  const index = siblings.findIndex((s) => s.id === id)
  const swap = siblings[index + dir]
  if (index < 0 || !swap) return
  const current = siblings[index]

  await db.update(navigationItems).set({ sortOrder: swap.sortOrder, updatedAt: new Date() }).where(eq(navigationItems.id, current.id))
  await db.update(navigationItems).set({ sortOrder: current.sortOrder, updatedAt: new Date() }).where(eq(navigationItems.id, swap.id))
  await audit('reorder', 'navigation_item', id, { location, dir })
  revalidatePath('/admin/header')
  revalidatePath('/admin/footer')
  revalidateSite()
}

// ---------- Header settings & footer columns ----------

export async function saveHeaderSettingsAction(formData: FormData) {
  await requireAdmin()
  await db
    .insert(headerSettings)
    .values({
      id: 1,
      logoMediaId: optionalStr(formData, 'logoMediaId'),
      ctaLabel: str(formData, 'ctaLabel') || 'Get a free quote',
      ctaHref: str(formData, 'ctaHref') || '/get-a-quote',
      whatsappEnabled: str(formData, 'whatsappEnabled') === 'true',
      whatsappNumber: optionalStr(formData, 'whatsappNumber'),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: headerSettings.id,
      set: {
        logoMediaId: optionalStr(formData, 'logoMediaId'),
        ctaLabel: str(formData, 'ctaLabel') || 'Get a free quote',
        ctaHref: str(formData, 'ctaHref') || '/get-a-quote',
        whatsappEnabled: str(formData, 'whatsappEnabled') === 'true',
        whatsappNumber: optionalStr(formData, 'whatsappNumber'),
        updatedAt: new Date(),
      },
    })
  await audit('update', 'header_settings', '1')
  revalidatePath('/admin/header')
  revalidateSite()
}

export async function createFooterColumnAction(formData: FormData) {
  await requireAdmin()
  const title = str(formData, 'title')
  if (!title) return
  const maxOrder = await db.query.footerColumns.findMany({
    orderBy: (t, { desc }) => [desc(t.sortOrder)],
    limit: 1,
  })
  await db.insert(footerColumns).values({
    title,
    sortOrder: (maxOrder[0]?.sortOrder ?? -1) + 1,
    isVisible: true,
  })
  await audit('create', 'footer_column', undefined, { title })
  revalidatePath('/admin/footer')
  revalidateSite()
}

export async function deleteFooterColumnAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  // Links inside the column lose their column assignment (FK SET NULL) and
  // fall back into the first footer column on the frontend.
  await db.delete(footerColumns).where(eq(footerColumns.id, id))
  await audit('delete', 'footer_column', id)
  revalidatePath('/admin/footer')
  revalidateSite()
}

// ---------- Products ----------

export async function saveProductAction(formData: FormData) {
  await requireAdmin()
  const id = optionalStr(formData, 'id')
  const name = str(formData, 'name')
  const slug = str(formData, 'slug').toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const price = Number(formData.get('price') ?? 0)
  if (!name || !slug || Number.isNaN(price)) return

  const values = {
    name,
    slug,
    description: str(formData, 'description'),
    price: price.toFixed(2),
    currency: str(formData, 'currency') || 'PKR',
    comparePrice: (() => {
      const raw = str(formData, 'comparePrice')
      if (!raw) return null
      const n = Number(raw)
      return Number.isFinite(n) ? n.toFixed(2) : null
    })(),
    features: str(formData, 'features').split('\n').map((l) => l.trim()).filter(Boolean),
    category: str(formData, 'category'),
    ctaLabel: optionalStr(formData, 'ctaLabel'),
    whatsappMessage: optionalStr(formData, 'whatsappMessage'),
    showOnHomepage: str(formData, 'showOnHomepage') === 'true',
    isPopular: str(formData, 'isPopular') === 'true',
    mediaId: optionalStr(formData, 'mediaId'),
    status: (str(formData, 'status') || 'draft') as 'draft' | 'active' | 'archived',
    sortOrder: Number(formData.get('sortOrder') ?? 0) || 0,
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(products).set(values).where(eq(products.id, id))
    await audit('update', 'product', id)
  } else {
    await db.insert(products).values(values)
    await audit('create', 'product', undefined, { name, slug })
  }
  revalidatePath('/admin/products')
  revalidateSite()
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(products).where(eq(products.id, id))
  await audit('delete', 'product', id)
  revalidatePath('/admin/products')
  revalidateSite()
}

async function moveCatalogRow<T extends { id: string; sortOrder: number }>(
  rows: T[],
  id: string,
  dir: number,
): Promise<{ current: T; swap: T } | null> {
  const index = rows.findIndex((r) => r.id === id)
  const swap = rows[index + dir]
  if (index < 0 || !swap) return null
  return { current: rows[index], swap }
}

export async function toggleServiceAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const row = await db.query.services.findFirst({ where: eq(services.id, id) })
  if (!row) return
  await db.update(services).set({ isActive: !row.isActive, updatedAt: new Date() }).where(eq(services.id, id))
  await audit('toggle', 'service', id, { isActive: !row.isActive })
  revalidatePath('/admin/services')
  revalidateSite()
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const row = await db.query.products.findFirst({ where: eq(products.id, id) })
  if (!row) return
  const next = row.status === 'active' ? 'draft' : 'active'
  await db.update(products).set({ status: next, updatedAt: new Date() }).where(eq(products.id, id))
  await audit('toggle', 'product', id, { status: next })
  revalidatePath('/admin/products')
  revalidateSite()
}

export async function moveServiceAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  const dir = str(formData, 'dir') === 'up' ? -1 : 1
  if (!id) return
  const siblings = await db.query.services.findMany({ orderBy: [asc(services.sortOrder), asc(services.title)] })
  const pair = await moveCatalogRow(siblings, id, dir)
  if (!pair) return
  await db.update(services).set({ sortOrder: pair.swap.sortOrder, updatedAt: new Date() }).where(eq(services.id, pair.current.id))
  await db.update(services).set({ sortOrder: pair.current.sortOrder, updatedAt: new Date() }).where(eq(services.id, pair.swap.id))
  await audit('reorder', 'service', id, { dir })
  revalidatePath('/admin/services')
  revalidateSite()
}

export async function moveProductAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  const dir = str(formData, 'dir') === 'up' ? -1 : 1
  if (!id) return
  const siblings = await db.query.products.findMany({ orderBy: [asc(products.sortOrder), asc(products.name)] })
  const pair = await moveCatalogRow(siblings, id, dir)
  if (!pair) return
  await db.update(products).set({ sortOrder: pair.swap.sortOrder, updatedAt: new Date() }).where(eq(products.id, pair.current.id))
  await db.update(products).set({ sortOrder: pair.current.sortOrder, updatedAt: new Date() }).where(eq(products.id, pair.swap.id))
  await audit('reorder', 'product', id, { dir })
  revalidatePath('/admin/products')
  revalidateSite()
}

// ---------- Services ----------

export async function saveServiceAction(formData: FormData) {
  await requireAdmin()
  const id = optionalStr(formData, 'id')
  const title = str(formData, 'title')
  const slug = str(formData, 'slug').toLowerCase().replace(/[^a-z0-9-]/g, '-')
  if (!title || !slug) return

  const features = str(formData, 'features')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const values = {
    title,
    slug,
    description: str(formData, 'description'),
    features,
    category: str(formData, 'category'),
    icon: optionalStr(formData, 'icon'),
    ctaLabel: optionalStr(formData, 'ctaLabel'),
    whatsappMessage: optionalStr(formData, 'whatsappMessage'),
    showOnHomepage: str(formData, 'showOnHomepage') === 'true',
    sortOrder: Number(formData.get('sortOrder') ?? 0) || 0,
    isActive: str(formData, 'isActive') !== 'false',
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(services).set(values).where(eq(services.id, id))
    await audit('update', 'service', id)
  } else {
    await db.insert(services).values(values)
    await audit('create', 'service', undefined, { title, slug })
  }
  revalidatePath('/admin/services')
  revalidateSite()
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(services).where(eq(services.id, id))
  await audit('delete', 'service', id)
  revalidatePath('/admin/services')
  revalidateSite()
}

// ---------- WhatsApp ----------

export async function saveWhatsAppSettingsAction(formData: FormData) {
  await requireAdmin()
  const visibility = str(formData, 'visibility') === 'exclude' ? 'exclude' : 'all'
  await db
    .insert(whatsappSettings)
    .values({
      id: 1,
      widgetEnabled: str(formData, 'widgetEnabled') === 'true',
      defaultMessage: str(formData, 'defaultMessage') || 'Hello! I visited your website and would like to inquire about your services.',
      visibility,
      hiddenPages: str(formData, 'hiddenPages'),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: whatsappSettings.id,
      set: {
        widgetEnabled: str(formData, 'widgetEnabled') === 'true',
        defaultMessage: str(formData, 'defaultMessage') || 'Hello! I visited your website and would like to inquire about your services.',
        visibility,
        hiddenPages: str(formData, 'hiddenPages'),
        updatedAt: new Date(),
      },
    })
  await audit('update', 'whatsapp_settings', '1')
  revalidatePath('/admin/whatsapp')
  revalidateSite()
}

export async function saveWhatsAppNumberAction(formData: FormData) {
  await requireAdmin()
  const id = optionalStr(formData, 'id')
  const label = str(formData, 'label')
  const phone = str(formData, 'phone').replace(/\D/g, '')
  if (!label || !phone) return
  const values = {
    label,
    phone,
    sortOrder: Number(formData.get('sortOrder') ?? 0) || 0,
    isActive: str(formData, 'isActive') !== 'false',
  }
  if (id) {
    await db.update(whatsappNumbers).set(values).where(eq(whatsappNumbers.id, id))
    await audit('update', 'whatsapp_number', id)
  } else {
    await db.insert(whatsappNumbers).values(values)
    await audit('create', 'whatsapp_number', undefined, { label })
  }
  revalidatePath('/admin/whatsapp')
  revalidateSite()
}

export async function deleteWhatsAppNumberAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(whatsappNumbers).where(eq(whatsappNumbers.id, id))
  await audit('delete', 'whatsapp_number', id)
  revalidatePath('/admin/whatsapp')
  revalidateSite()
}

export async function toggleWhatsAppNumberAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const row = await db.query.whatsappNumbers.findFirst({ where: eq(whatsappNumbers.id, id) })
  if (!row) return
  await db.update(whatsappNumbers).set({ isActive: !row.isActive }).where(eq(whatsappNumbers.id, id))
  await audit('toggle', 'whatsapp_number', id, { isActive: !row.isActive })
  revalidatePath('/admin/whatsapp')
  revalidateSite()
}

// ---------- Inquiries ----------

export async function toggleInquiryReadAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  const row = await db.query.contactInquiries.findFirst({ where: eq(contactInquiries.id, id) })
  if (!row) return
  const next = row.status === 'new' ? 'viewed' : 'new'
  await db.update(contactInquiries).set({ status: next, updatedAt: new Date() }).where(eq(contactInquiries.id, id))
  await audit('toggle', 'contact_inquiry', id, { status: next })
  revalidatePath('/admin/inquiries')
}

export async function deleteInquiryAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(contactInquiries).where(eq(contactInquiries.id, id))
  await audit('delete', 'contact_inquiry', id)
  revalidatePath('/admin/inquiries')
}

export async function updateInquiryAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  const status = str(formData, 'status')
  if (!id || !['new', 'viewed', 'replied', 'archived'].includes(status)) return
  await db
    .update(contactInquiries)
    .set({ status, adminNotes: optionalStr(formData, 'adminNotes'), updatedAt: new Date() })
    .where(eq(contactInquiries.id, id))
  await audit('update', 'contact_inquiry', id, { status })
  revalidatePath('/admin/inquiries')
}

// ---------- Orders ----------

const ORDER_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const PAYMENT_STATUSES = ['unpaid', 'pending_verification', 'paid', 'failed', 'refunded']

export async function updateOrderAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  const orderStatus = str(formData, 'orderStatus')
  const paymentStatus = str(formData, 'paymentStatus')
  if (!id) return
  if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) return
  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) return

  await db
    .update(orders)
    .set({
      ...(orderStatus ? { orderStatus } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      adminNotes: optionalStr(formData, 'adminNotes'),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
  await audit('update', 'order', id, { orderStatus, paymentStatus })
  revalidatePath('/admin/orders')
}

export async function deleteOrderAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(orders).where(eq(orders.id, id))
  await audit('delete', 'order', id)
  revalidatePath('/admin/orders')
}

// ---------- Blog posts ----------

export async function saveBlogPostAction(formData: FormData) {
  await requireAdmin()
  const id = optionalStr(formData, 'id')
  const title = str(formData, 'title')
  const slug = str(formData, 'slug').toLowerCase().replace(/[^a-z0-9-]/g, '-')
  if (!title || !slug) return

  // Content is stored as structured sections — never raw HTML.
  let content: { heading: string; paragraphs: string[] }[] = []
  try {
    const parsed = JSON.parse(str(formData, 'content') || '[]')
    if (Array.isArray(parsed)) {
      content = parsed
        .map((s) => ({
          heading: String(s?.heading ?? '').trim().slice(0, 200),
          paragraphs: (Array.isArray(s?.paragraphs) ? s.paragraphs : String(s?.paragraphs ?? '').split('\n'))
            .map((p: unknown) => String(p).trim())
            .filter(Boolean)
            .slice(0, 20),
        }))
        .filter((s) => s.heading || s.paragraphs.length > 0)
        .slice(0, 30)
    }
  } catch {
    return
  }

  const status = str(formData, 'status') === 'published' ? 'published' : 'draft'
  const publishedAtRaw = str(formData, 'publishedAt')
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : status === 'published' ? new Date() : null

  const values = {
    title,
    slug,
    excerpt: str(formData, 'excerpt'),
    category: str(formData, 'category') || 'Journal',
    image: str(formData, 'image'),
    content,
    tags: str(formData, 'tags').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10),
    readTime: str(formData, 'readTime'),
    status: status as 'draft' | 'published',
    seoTitle: optionalStr(formData, 'seoTitle'),
    seoDescription: optionalStr(formData, 'seoDescription'),
    publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(blogPosts).set(values).where(eq(blogPosts.id, id))
    await audit('update', 'blog_post', id, { slug })
  } else {
    await db.insert(blogPosts).values(values)
    await audit('create', 'blog_post', undefined, { slug, title })
  }
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidateSite()
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin()
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
  await audit('delete', 'blog_post', id)
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidateSite()
}

// ---------- Design settings ----------

export async function saveDesignSettingsAction(formData: FormData) {
  await requireAdmin()
  const raw: Record<string, unknown> = {}
  for (const key of [
    'primary', 'accent', 'background', 'surface', 'text', 'muted', 'border',
    'headingFont', 'bodyFont', 'sectionSpacing', 'buttonRadius', 'faviconUrl',
  ]) {
    raw[key] = str(formData, key)
  }
  for (const key of ['baseFontSize', 'contentWidth', 'borderRadius']) {
    raw[key] = Number(formData.get(key))
  }
  raw.cardShadow = str(formData, 'cardShadow') === 'true'

  await db
    .insert(designSettings)
    .values({ id: 1, values: raw, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: designSettings.id,
      set: { values: raw, updatedAt: new Date() },
    })
  await audit('update', 'design_settings', '1')
  revalidatePath('/admin/design')
  revalidatePath('/', 'layout')
}

// Media actions live in ./media/actions.ts (upload/replace/delete/assign/slides).

