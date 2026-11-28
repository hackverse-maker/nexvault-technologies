import { handleUpload } from '@vercel/blob/client'
import { MAX_UPLOAD_BYTES } from '@/lib/media'
import { getAdminSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        addRandomSuffix: true,
      }),
    })
    return Response.json(jsonResponse)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return Response.json({ error: message }, { status: 400 })
  }
}
