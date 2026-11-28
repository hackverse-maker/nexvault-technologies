'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { History, Loader2, Rocket } from 'lucide-react'
import { publishPageAction, restoreVersionAction, type PublishResult } from '@/app/admin/(panel)/actions'

const miniBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--line)',
  color: '#aac0d5',
  borderRadius: 5,
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

export function PublishPageButton({ pageId, label = 'Publish' }: { pageId: string; label?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <button
        style={{ ...miniBtn, color: '#70e6ac', borderColor: 'rgba(71,226,165,.3)' }}
        disabled={pending}
        onClick={() => {
          if (!window.confirm('Are you sure you want to publish these changes to your live website?')) return
          setError('')
          startTransition(async () => {
            const res: PublishResult = await publishPageAction(pageId)
            if (!res.ok) setError(res.error ?? 'Publish failed')
            router.refresh()
          })
        }}
      >
        {pending ? <Loader2 size={11} className="animate-spin" /> : <Rocket size={11} />} {label}
      </button>
      {error && <span style={{ fontSize: 10, color: '#f0a3a3' }}>{error}</span>}
    </span>
  )
}

export function RestoreVersionButton({ pageId, versionId, versionNumber }: { pageId: string; versionId: string; versionNumber: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <button
        style={miniBtn}
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Restore version ${versionNumber} into the draft? The live site will not change until you publish.`)) return
          setError('')
          startTransition(async () => {
            const res = await restoreVersionAction(pageId, versionId)
            if (!res.ok) setError(res.error ?? 'Restore failed')
            router.refresh()
          })
        }}
      >
        {pending ? <Loader2 size={11} className="animate-spin" /> : <History size={11} />} Restore to draft
      </button>
      {error && <span style={{ fontSize: 10, color: '#f0a3a3' }}>{error}</span>}
    </span>
  )
}
