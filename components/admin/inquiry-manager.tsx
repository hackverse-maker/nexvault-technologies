'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Mail, MessageCircle, Search, Trash2 } from 'lucide-react'
import { Badge, Card, EmptyState, inputStyle, labelStyle, tdStyle, thStyle } from './ui'
import {
  deleteInquiryAction,
  toggleInquiryReadAction,
  updateInquiryAction,
} from '@/app/admin/(panel)/actions'

export type InquiryItem = {
  id: string
  fullName: string
  email: string
  businessName: string | null
  phone: string | null
  subject: string | null
  message: string
  requestedPackage: string | null
  serviceName: string | null
  productName: string | null
  status: string
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

const STATUSES = ['new', 'viewed', 'replied', 'archived'] as const
const statusTone = { new: 'cyan', viewed: 'amber', replied: 'green', archived: 'slate' } as const

const smallBtn: React.CSSProperties = {
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

export function InquiryManager({ items }: { items: InquiryItem[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    for (const s of STATUSES) c[s] = items.filter((i) => i.status === s).length
    return c
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      if (status !== 'all' && i.status !== status) return false
      if (!q) return true
      return [i.fullName, i.email, i.businessName, i.phone, i.subject, i.message, i.requestedPackage, i.serviceName, i.productName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [items, query, status])

  function run(fn: (fd: FormData) => Promise<unknown>, fields: Record<string, string>) {
    startTransition(async () => {
      const fd = new FormData()
      for (const [k, v] of Object.entries(fields)) fd.set(k, v)
      await fn(fd)
      router.refresh()
    })
  }

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 15, margin: 0, flex: 1 }}>Inquiries ({filtered.length}{filtered.length !== items.length ? ` of ${items.length}` : ''})</h2>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, message…"
            style={{ ...inputStyle, width: 240, paddingLeft: 30, fontSize: 12 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '6px 13px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.5px',
              border: '1px solid var(--line)',
              cursor: 'pointer',
              background: status === s ? 'rgba(0,200,255,.12)' : 'transparent',
              color: status === s ? 'var(--cyan)' : '#8aa0b8',
            }}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState text={items.length === 0 ? 'No inquiries yet.' : 'No inquiries match your filters.'} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['From', 'Subject / Service', 'Message', 'Status', 'Received', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ background: item.status === 'new' ? 'rgba(0,200,255,.03)' : undefined }}>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item.fullName}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#8aa0b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={10} /> {item.email}
                    </p>
                    {item.businessName && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>{item.businessName}</p>}
                    {item.phone && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>{item.phone}</p>}
                  </td>
                  <td style={tdStyle}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{item.subject || '—'}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>
                      {[item.serviceName, item.productName, item.requestedPackage].filter(Boolean).join(' · ') || 'General inquiry'}
                    </p>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 260 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#b7c6d6', display: '-webkit-box', WebkitLineClamp: expanded === item.id ? undefined : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: expanded === item.id ? 'pre-wrap' : undefined }}>
                      {item.message}
                    </p>
                    <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} style={{ ...smallBtn, marginTop: 6, color: 'var(--cyan)', border: 'none', padding: '2px 0' }}>
                      {expanded === item.id ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> Full message</>}
                    </button>
                  </td>
                  <td style={tdStyle}><Badge tone={statusTone[item.status as keyof typeof statusTone] ?? 'slate'}>{item.status}</Badge></td>
                  <td style={{ ...tdStyle, fontSize: 11, color: '#5f7a99', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button style={smallBtn} disabled={pending}
                        onClick={() => run(toggleInquiryReadAction, { id: item.id })}>
                        <MessageCircle size={11} /> {item.status === 'new' ? 'Mark read' : 'Mark unread'}
                      </button>
                      <button style={{ ...smallBtn, color: '#f0a3a3', borderColor: 'rgba(240,163,163,.3)' }} disabled={pending}
                        onClick={() => { if (confirm('Delete this inquiry?')) run(deleteInquiryAction, { id: item.id }) }}>
                        <Trash2 size={11} />
                      </button>
                      <details>
                        <summary style={{ ...smallBtn, listStyle: 'none', cursor: 'pointer' }}>Manage</summary>
                        <form action={updateInquiryAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minWidth: 240, position: 'relative' }}>
                          <input type="hidden" name="id" value={item.id} />
                          <label style={labelStyle}>Status
                            <select name="status" defaultValue={item.status} style={inputStyle}>
                              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>Admin notes<textarea name="adminNotes" rows={2} defaultValue={item.adminNotes ?? ''} style={{ ...inputStyle, resize: 'vertical' }} /></label>
                          <button className="button primary" type="submit" style={{ fontSize: 12, padding: '10px 14px' }}>Update</button>
                        </form>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
