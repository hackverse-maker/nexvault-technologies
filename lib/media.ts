// Shared media helpers — safe to import from both client and server code.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const

export const RESPONSIVE_WIDTHS = [480, 768, 1200, 1600] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
}

/** Sanitized folder name used for organizing the library. */
export function normalizeFolder(value: string | null | undefined): string {
  const cleaned = (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'general'
}

/** Canonical site-facing URL for a media_library row (served via the optimizer). */
export function mediaImagePath(mediaId: string): string {
  return `/api/img/${mediaId}`
}

/**
 * If `src` points at our optimizer route, returns a srcset covering the
 * standard responsive widths. Otherwise returns undefined.
 */
export function mediaSrcSet(src: string): string | undefined {
  const match = /^\/api\/img\/([0-9a-f-]{36})(\?.*)?$/i.exec(src)
  if (!match) return undefined
  const id = match[1]
  const suffix = match[2] ?? ''
  return RESPONSIVE_WIDTHS.map((w) => `${mediaImagePath(id)}${suffix ? `${suffix}&` : '?'}w=${w} ${w}w`).join(', ')
}

/** Best-guess mime type from a file name or URL, used when the browser omits it. */
export function mimeFromName(name: string): string {
  const clean = name.split('?')[0].split('#')[0]
  const ext = clean.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'avif':
      return 'image/avif'
    default:
      return 'application/octet-stream'
  }
}
