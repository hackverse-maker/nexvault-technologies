'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  activityLogs,
  contactInquiries,
  contactInformation,
  footerColumns,
  footerConfiguration,
  headerSettings,
  navigationItems,
  pages,
  products,
  sections,
  services,
  socialMediaLinks,
  websiteSettings,
} from '@/lib/db/schema'
import { getAdminSession } from '@/lib/auth/session'

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
}

export async function updatePageAction(formData: FormData) {
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
      publishedAt: status === 'published' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
  await audit('update', 'page', id, { slug: slug || undefined, status })
  revalidatePath('/admin/pages')
  revalidatePath('/admin/seo')
  revalidatePath('/admin/sections')
}

export async function deletePageAction(formData: FormData) {
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
  revalidatePath('/admin/sections')
  revalidatePath('/admin/header')
  revalidatePath('/admin/footer')
}

export async function duplicatePageAction(formData: FormData) {
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
  revalidatePath('/admin/sections')
}

// ---------- Sections ----------

export async function createSectionAction(formData: FormData) {
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
  await audit('create', 'section', undefined, { pageId, sectionType })
  revalidatePath('/admin/sections')
}

export async function updateSectionAction(formData: FormData) {
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
  await audit('update', 'section', id)
  revalidatePath('/admin/sections')
}

export async function toggleSectionAction(formData: FormData) {
  const id = str(formData, 'id')
  const isVisible = str(formData, 'isVisible') === 'true'
  if (!id) return
  await db.update(sections).set({ isVisible, updatedAt: new Date() }).where(eq(sections.id, id))
  await audit('toggle', 'section', id, { isVisible })
  revalidatePath('/admin/sections')
}

export async function deleteSectionAction(formData: FormData) {
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(sections).where(eq(sections.id, id))
  await audit('delete', 'section', id)
  revalidatePath('/admin/sections')
}

// ---------- Object-arg variants for the visual section builder ----------

export async function createSectionObj(pageId: string, sectionType: string, content?: Record<string, unknown>) {
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
  await audit('create', 'section', row?.id, { pageId, sectionType })
  revalidatePath('/admin/sections')
  revalidatePath(`/admin/builder`)
  return { id: row?.id }
}

export async function updateSectionObj(id: string, content: Record<string, unknown>, isVisible: boolean) {
  if (!id) return { error: 'Missing section id' }
  await db.update(sections).set({ content, isVisible, updatedAt: new Date() }).where(eq(sections.id, id))
  await audit('update', 'section', id)
  revalidatePath('/admin/sections')
  revalidatePath('/admin/builder')
  return { ok: true }
}

export async function duplicateSectionObj(id: string) {
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
  await audit('duplicate', 'section', row?.id, { sourceId: id })
  revalidatePath('/admin/sections')
  revalidatePath('/admin/builder')
  return { id: row?.id }
}

export async function reorderSectionsObj(pageId: string, orderedIds: string[]) {
  if (!pageId || !Array.isArray(orderedIds)) return { error: 'Invalid reorder payload' }
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx.update(sections).set({ sortOrder: i, updatedAt: new Date() }).where(eq(sections.id, orderedIds[i]))
    }
  })
  await audit('reorder', 'sections', pageId, { count: orderedIds.length })
  revalidatePath('/admin/sections')
  revalidatePath('/admin/builder')
  return { ok: true }
}

export async function deleteSectionObj(id: string) {
  if (!id) return { error: 'Missing section id' }
  await db.delete(sections).where(eq(sections.id, id))
  await audit('delete', 'section', id)
  revalidatePath('/admin/sections')
  revalidatePath('/admin/builder')
  return { ok: true }
}

// ---------- Website settings / business info / footer ----------

export async function saveWebsiteSettingsAction(formData: FormData) {
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
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(socialMediaLinks).where(eq(socialMediaLinks.id, id))
  await audit('delete', 'social_media_link', id)
  revalidatePath('/admin/business')
  revalidatePath('/admin/footer')
  revalidateSite()
}

export async function saveFooterConfigAction(formData: FormData) {
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
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(navigationItems).where(eq(navigationItems.id, id))
  await audit('delete', 'navigation_item', id)
  revalidatePath('/admin/header')
  revalidatePath('/admin/footer')
  revalidateSite()
}

export async function moveNavItemAction(formData: FormData) {
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
}

export async function deleteProductAction(formData: FormData) {
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(products).where(eq(products.id, id))
  await audit('delete', 'product', id)
  revalidatePath('/admin/products')
}

// ---------- Services ----------

export async function saveServiceAction(formData: FormData) {
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
}

export async function deleteServiceAction(formData: FormData) {
  const id = str(formData, 'id')
  if (!id) return
  await db.delete(services).where(eq(services.id, id))
  await audit('delete', 'service', id)
  revalidatePath('/admin/services')
}

// ---------- Inquiries ----------

export async function updateInquiryAction(formData: FormData) {
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

// Media actions live in ./media/actions.ts (upload/replace/delete/assign/slides).

