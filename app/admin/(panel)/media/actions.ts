'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import {
  activityLogs,
  heroSlides,
  mediaAssignments,
  mediaLibrary,
  sliderSlides,
  sliders,
} from '@/lib/db/schema'
import { getAdminSession } from '@/lib/auth/session'
import { MAX_UPLOAD_BYTES, isAllowedMimeType, mimeFromName, normalizeFolder } from '@/lib/media'

async function requireAdmin() {
  const session = await getAdminSession()
  return session
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

function revalidateMedia() {
  revalidatePath('/admin/media')
}

function revalidateSite() {
  revalidatePath('/', 'layout')
}

type UploadPayload = {
  publicUrl: string
  objectKey: string
  originalName: string
  mimeType: string
  byteSize: number
  width?: number | null
  height?: number | null
  altText?: string
  caption?: string
  folder?: string
  tags?: string[]
}

function sanitizeUpload(p: UploadPayload) {
  const mimeType = p.mimeType || mimeFromName(p.originalName)
  if (!p.publicUrl || !p.objectKey) return { error: 'Missing blob URL or key' as const }
  if (!isAllowedMimeType(mimeType)) return { error: `Unsupported file type: ${mimeType}` as const }
  if (!Number.isFinite(p.byteSize) || p.byteSize <= 0 || p.byteSize > MAX_UPLOAD_BYTES) {
    return { error: `File size must be between 1 byte and ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB` as const }
  }
  return {
    values: {
      storageProvider: 'vercel_blob',
      objectKey: p.objectKey,
      publicUrl: p.publicUrl,
      originalName: p.originalName.slice(0, 255) || 'image',
      mimeType,
      byteSize: Math.round(p.byteSize),
      width: p.width && p.width > 0 ? Math.round(p.width) : null,
      height: p.height && p.height > 0 ? Math.round(p.height) : null,
      altText: (p.altText ?? '').slice(0, 500),
      caption: (p.caption ?? '').slice(0, 500),
      folder: normalizeFolder(p.folder),
      tags: Array.isArray(p.tags) ? p.tags.map((t) => String(t).slice(0, 60)).filter(Boolean).slice(0, 20) : [],
    },
  }
}

/** Called by the client after @vercel/blob upload() completes. */
export async function registerUploadedMediaAction(payload: UploadPayload) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  const result = sanitizeUpload(payload)
  if ('error' in result) return result

  const session = await getAdminSession()
  const [row] = await db
    .insert(mediaLibrary)
    .values({ ...result.values, uploadedBy: session?.adminUserId ?? null })
    .returning({ id: mediaLibrary.id })
  await audit('create', 'media', row?.id, { publicUrl: payload.publicUrl, folder: result.values.folder })
  revalidateMedia()
  return { id: row?.id }
}

/** Register an externally hosted image URL (e.g. Unsplash, CDN). */
export async function registerExternalMediaAction(payload: {
  publicUrl: string
  originalName?: string
  mimeType?: string
  byteSize: number
  width?: number | null
  height?: number | null
  altText?: string
  caption?: string
  folder?: string
  tags?: string[]
}) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  const mimeType = payload.mimeType || mimeFromName(payload.publicUrl)
  if (!payload.publicUrl || !/^https?:\/\//.test(payload.publicUrl)) return { error: 'A valid http(s) URL is required' }

  // Best-effort real size via HEAD so library metadata isn't fabricated.
  let byteSize = payload.byteSize
  try {
    const head = await fetch(payload.publicUrl, { method: 'HEAD' })
    const len = Number(head.headers.get('content-length'))
    if (Number.isFinite(len) && len > 0) byteSize = len
  } catch {
    // keep client-provided size
  }
  if (!Number.isFinite(byteSize) || byteSize <= 0) return { error: 'Invalid file size' }

  const [row] = await db
    .insert(mediaLibrary)
    .values({
      storageProvider: 'external',
      objectKey: payload.publicUrl,
      publicUrl: payload.publicUrl,
      originalName: (payload.originalName || payload.publicUrl.split('/').pop() || 'external-asset').slice(0, 255),
      mimeType,
      byteSize: Math.round(payload.byteSize),
      width: payload.width && payload.width > 0 ? Math.round(payload.width) : null,
      height: payload.height && payload.height > 0 ? Math.round(payload.height) : null,
      altText: (payload.altText ?? '').slice(0, 500),
      caption: (payload.caption ?? '').slice(0, 500),
      folder: normalizeFolder(payload.folder),
      tags: Array.isArray(payload.tags) ? payload.tags.map((t) => String(t).slice(0, 60)).filter(Boolean).slice(0, 20) : [],
    })
    .returning({ id: mediaLibrary.id })
  await audit('create', 'media', row?.id, { publicUrl: payload.publicUrl, provider: 'external' })
  revalidateMedia()
  return { id: row?.id }
}

export async function updateMediaAction(payload: {
  id: string
  altText?: string
  caption?: string
  folder?: string
  tags?: string[]
}) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!payload.id) return { error: 'Missing id' }
  await db
    .update(mediaLibrary)
    .set({
      altText: (payload.altText ?? '').slice(0, 500),
      caption: (payload.caption ?? '').slice(0, 500),
      folder: normalizeFolder(payload.folder),
      tags: Array.isArray(payload.tags) ? payload.tags.map((t) => String(t).slice(0, 60)).filter(Boolean).slice(0, 20) : [],
      updatedAt: new Date(),
    })
    .where(eq(mediaLibrary.id, payload.id))
  await audit('update', 'media', payload.id)
  revalidateMedia()
  return { ok: true }
}

/** Replace the underlying file for an existing media row. */
export async function replaceMediaAction(payload: UploadPayload & { id: string }) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  const result = sanitizeUpload(payload)
  if ('error' in result) return result
  const existing = await db.query.mediaLibrary.findFirst({ where: eq(mediaLibrary.id, payload.id) })
  if (!existing) return { error: 'Media not found' }

  await db
    .update(mediaLibrary)
    .set({ ...result.values, updatedAt: new Date() })
    .where(eq(mediaLibrary.id, payload.id))

  // Best-effort cleanup of the previous blob (external URLs are not ours to delete).
  if (existing.storageProvider === 'vercel_blob' && existing.publicUrl !== payload.publicUrl) {
    try {
      await del(existing.publicUrl)
    } catch {
      // orphaned blob is acceptable; row no longer references it
    }
  }
  await audit('replace', 'media', payload.id, { publicUrl: payload.publicUrl })
  revalidateMedia()
  return { ok: true }
}

export async function deleteMediaAction(id: string) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!id) return { error: 'Missing id' }
  const existing = await db.query.mediaLibrary.findFirst({ where: eq(mediaLibrary.id, id) })
  if (!existing) return { error: 'Media not found' }

  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id))
  if (existing.storageProvider === 'vercel_blob') {
    try {
      await del(existing.publicUrl)
    } catch {
      // DB row is gone; a stranded blob can be cleaned up manually
    }
  }
  await audit('delete', 'media', id, { publicUrl: existing.publicUrl })
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

// ---------- Assignments ----------

export async function assignMediaAction(payload: {
  mediaId: string
  targetType: 'page' | 'section' | 'product' | 'service' | 'header' | 'footer' | 'website'
  targetId?: string | null
  role?: string
}) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!payload.mediaId || !payload.targetType) return { error: 'Missing media or target' }
  const role = (payload.role ?? 'image').slice(0, 40)
  const targetId = payload.targetId ?? null

  const candidates = await db.query.mediaAssignments.findMany({
    where: and(
      eq(mediaAssignments.mediaId, payload.mediaId),
      eq(mediaAssignments.targetType, payload.targetType),
      eq(mediaAssignments.role, role),
    ),
  })
  const existing = candidates.find((c) => (c.targetId ?? null) === targetId)
  if (existing) {
    await db
      .update(mediaAssignments)
      .set({ targetId })
      .where(eq(mediaAssignments.id, existing.id))
  } else {
    await db.insert(mediaAssignments).values({
      mediaId: payload.mediaId,
      targetType: payload.targetType,
      targetId: payload.targetId ?? null,
      role,
    })
  }
  await audit('assign', 'media', payload.mediaId, { targetType: payload.targetType, targetId: payload.targetId, role })
  revalidateMedia()
  return { ok: true }
}

export async function unassignMediaAction(assignmentId: string) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!assignmentId) return { error: 'Missing id' }
  await db.delete(mediaAssignments).where(eq(mediaAssignments.id, assignmentId))
  await audit('unassign', 'media_assignment', assignmentId)
  revalidateMedia()
  return { ok: true }
}

// ---------- Hero slides (homepage hero banners) ----------

type SlidePayload = {
  id?: string
  mediaId?: string | null
  title?: string
  subtitle?: string
  caption?: string
  ctaLabel?: string
  ctaHref?: string
  sortOrder?: number
  isVisible?: boolean
}

function slideValues(p: SlidePayload) {
  return {
    mediaId: p.mediaId || null,
    title: (p.title ?? '').slice(0, 200),
    subtitle: (p.subtitle ?? '').slice(0, 300),
    ctaLabel: (p.ctaLabel ?? '').slice(0, 80),
    ctaHref: (p.ctaHref ?? '').slice(0, 300),
    sortOrder: Number.isFinite(p.sortOrder) ? Math.round(p.sortOrder!) : 0,
    isVisible: p.isVisible !== false,
  }
}

export async function saveHeroSlideAction(payload: SlidePayload) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  let values = { ...slideValues(payload), updatedAt: new Date() }
  if (payload.id && payload.sortOrder === undefined) {
    const existing = await db.query.heroSlides.findFirst({ where: eq(heroSlides.id, payload.id) })
    if (existing) values = { ...values, sortOrder: existing.sortOrder }
  }
  if (payload.id) {
    await db.update(heroSlides).set(values).where(eq(heroSlides.id, payload.id))
    await audit('update', 'hero_slide', payload.id)
  } else {
    const [row] = await db.insert(heroSlides).values(values).returning({ id: heroSlides.id })
    await audit('create', 'hero_slide', row?.id)
  }
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

export async function deleteHeroSlideAction(id: string) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!id) return { error: 'Missing id' }
  await db.delete(heroSlides).where(eq(heroSlides.id, id))
  await audit('delete', 'hero_slide', id)
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

export async function moveHeroSlideAction(id: string, dir: -1 | 1) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  const all = await db.query.heroSlides.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] })
  const index = all.findIndex((s) => s.id === id)
  const swap = all[index + dir]
  if (index < 0 || !swap) return { error: 'Cannot move' }
  const current = all[index]
  await db.update(heroSlides).set({ sortOrder: swap.sortOrder }).where(eq(heroSlides.id, current.id))
  await db.update(heroSlides).set({ sortOrder: current.sortOrder }).where(eq(heroSlides.id, swap.id))
  await audit('reorder', 'hero_slide', id, { dir })
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

export async function toggleHeroSlideAction(id: string, isVisible: boolean) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  await db.update(heroSlides).set({ isVisible, updatedAt: new Date() }).where(eq(heroSlides.id, id))
  await audit('toggle', 'hero_slide', id, { isVisible })
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

// ---------- Sliders ----------

export async function saveSliderAction(payload: {
  id?: string
  name: string
  slug?: string
  description?: string
  pageId?: string | null
  isVisible?: boolean
}) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  const name = (payload.name ?? '').trim()
  if (!name) return { error: 'Name is required' }
  const slug = (payload.slug || name).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  const values = {
    name: name.slice(0, 120),
    slug,
    description: (payload.description ?? '').slice(0, 300),
    pageId: payload.pageId || null,
    isVisible: payload.isVisible !== false,
    updatedAt: new Date(),
  }
  if (payload.id) {
    await db.update(sliders).set(values).where(eq(sliders.id, payload.id))
    await audit('update', 'slider', payload.id)
  } else {
    const [row] = await db.insert(sliders).values(values).returning({ id: sliders.id })
    await audit('create', 'slider', row?.id, { slug })
  }
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

export async function deleteSliderAction(id: string) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!id) return { error: 'Missing id' }
  await db.delete(sliders).where(eq(sliders.id, id)) // slides cascade
  await audit('delete', 'slider', id)
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

type SliderSlidePayload = SlidePayload & { sliderId: string }

export async function saveSliderSlideAction(payload: SliderSlidePayload) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!payload.sliderId) return { error: 'Missing slider' }
  const values = slideValues(payload)
  if (payload.id) {
    let finalValues = values
    if (payload.sortOrder === undefined) {
      const existing = await db.query.sliderSlides.findFirst({ where: eq(sliderSlides.id, payload.id) })
      if (existing) finalValues = { ...values, sortOrder: existing.sortOrder }
    }
    await db.update(sliderSlides).set(finalValues).where(eq(sliderSlides.id, payload.id))
    await audit('update', 'slider_slide', payload.id)
  } else {
    const [row] = await db.insert(sliderSlides).values({ ...values, sliderId: payload.sliderId }).returning({ id: sliderSlides.id })
    await audit('create', 'slider_slide', row?.id)
  }
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

export async function deleteSliderSlideAction(id: string) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  if (!id) return { error: 'Missing id' }
  await db.delete(sliderSlides).where(eq(sliderSlides.id, id))
  await audit('delete', 'slider_slide', id)
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

export async function moveSliderSlideAction(id: string, dir: -1 | 1) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  const slide = await db.query.sliderSlides.findFirst({ where: eq(sliderSlides.id, id) })
  if (!slide) return { error: 'Slide not found' }
  const siblings = await db.query.sliderSlides.findMany({
    where: eq(sliderSlides.sliderId, slide.sliderId),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  })
  const index = siblings.findIndex((s) => s.id === id)
  const swap = siblings[index + dir]
  if (index < 0 || !swap) return { error: 'Cannot move' }
  await db.update(sliderSlides).set({ sortOrder: swap.sortOrder }).where(eq(sliderSlides.id, slide.id))
  await db.update(sliderSlides).set({ sortOrder: siblings[index].sortOrder }).where(eq(sliderSlides.id, swap.id))
  await audit('reorder', 'slider_slide', id, { dir })
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}

export async function toggleSliderSlideAction(id: string, isVisible: boolean) {
  if (!(await requireAdmin())) return { error: 'Unauthorized' }
  await db.update(sliderSlides).set({ isVisible }).where(eq(sliderSlides.id, id))
  await audit('toggle', 'slider_slide', id, { isVisible })
  revalidateMedia()
  revalidateSite()
  return { ok: true }
}
