import { eq } from 'drizzle-orm'
import sharp from 'sharp'
import { db } from '@/lib/db'
import { mediaLibrary } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIN_WIDTH = 16
const MAX_WIDTH = 2400
const DEFAULT_WIDTH = 1600

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return new Response('Invalid media id', { status: 400 })
  }

  let media
  try {
    media = await db.query.mediaLibrary.findFirst({ where: eq(mediaLibrary.id, id) })
  } catch {
    return new Response('Media service unavailable', { status: 503 })
  }
  if (!media) {
    return new Response('Media not found', { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const widthParam = Number(searchParams.get('w') ?? DEFAULT_WIDTH)
  const width = Number.isFinite(widthParam)
    ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(widthParam)))
    : DEFAULT_WIDTH

  let upstream: Response
  try {
    upstream = await fetch(media.publicUrl, { next: { revalidate: 3600 } })
  } catch {
    return new Response('Upstream image unavailable', { status: 502 })
  }
  if (!upstream.ok) {
    return new Response('Upstream image unavailable', { status: 502 })
  }
  const input = Buffer.from(await upstream.arrayBuffer())

  // Animated GIFs are passed through untouched so animation is preserved.
  if (media.mimeType === 'image/gif') {
    return new Response(new Uint8Array(input), {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  }

  const output = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  return new Response(new Uint8Array(output), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
