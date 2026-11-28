'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, Eye, Loader2, Rocket, Save } from 'lucide-react'
import { publishGlobalsAction, publishPageAction, saveDraftAction, type PublishResult } from '@/app/admin/(panel)/actions'

function fmt(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 7,
  padding: '9px 14px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid var(--line)',
  background: 'transparent',
  color: '#aac0d5',
  textDecoration: 'none',
}

export function PublishBar({
  pageId,
  slug,
  status,
  draftSavedAt,
  publishedAt,
  hasSnapshot,
}: {
  pageId: string
  slug: string
  status: string
  draftSavedAt: string | null
  publishedAt: string | null
  hasSnapshot: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<'draft' | 'publish' | 'globals' | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const draft = draftSavedAt ? new Date(draftSavedAt).getTime() : 0
  const published = publishedAt ? new Date(publishedAt).getTime() : 0
  const unpublished = status === 'published' ? draft > published || !hasSnapshot : draft > 0

  function run(kind: 'draft' | 'publish' | 'globals', fn: () => Promise<PublishResult>) {
    setBusy(kind)
    setMessage(null)
    startTransition(async () => {
      const res = await fn()
      setBusy(null)
      setMessage(res.ok ? { ok: true, text: kind === 'publish' ? 'Your website has been updated successfully!' : kind === 'draft' ? 'Draft saved.' : 'Site cache refreshed — changes are live.' } : { ok: false, text: res.error ?? 'Something went wrong.' })
      router.refresh()
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={btnBase} disabled={pending} onClick={() => run('draft', () => saveDraftAction(pageId))}>
          {busy === 'draft' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save draft
        </button>
        <Link href={`/admin/preview?slug=${slug}`} style={{ ...btnBase, color: '#70ddff', borderColor: 'rgba(0,200,255,.3)' }}>
          <Eye size={14} /> Preview
        </Link>
        <button
          style={{ ...btnBase, background: 'linear-gradient(135deg,#008cff,#00c8ff)', color: '#04101f', border: 'none' }}
          disabled={pending}
          onClick={() => {
            if (!window.confirm('Are you sure you want to publish these changes to your live website?')) return
            run('publish', () => publishPageAction(pageId))
          }}
        >
          {busy === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />} Publish
        </button>
        {status === 'published' && (
          <a href={`/${slug}`} target="_blank" rel="noreferrer" style={btnBase}>
            <ExternalLink size={14} /> View live
          </a>
        )}
        <button style={{ ...btnBase, marginLeft: 'auto' }} disabled={pending} onClick={() => run('globals', () => publishGlobalsAction())} title="Refresh the live site cache for header, footer, design and settings changes">
          {busy === 'globals' ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />} Publish global changes
        </button>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', fontSize: 11, color: '#5f7a99' }}>
        {unpublished && <span style={{ color: '#f3ca47' }}>● Unpublished changes</span>}
        {draftSavedAt && <span>Draft saved {fmt(draftSavedAt)}</span>}
        {publishedAt && <span>Published {fmt(publishedAt)}</span>}
        {!publishedAt && hasSnapshot === false && status === 'published' && <span>Never published via workflow</span>}
        {message && <span style={{ color: message.ok ? '#70e6ac' : '#f0a3a3' }}>{message.text}</span>}
      </div>
    </div>
  )
}
