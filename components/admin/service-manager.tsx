'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { Badge, Card, EmptyState, inputStyle, labelStyle } from './ui'
import { ICON_OPTIONS } from '@/lib/icons'
import {
  deleteServiceAction,
  moveServiceAction,
  saveServiceAction,
  toggleServiceAction,
} from '@/app/admin/(panel)/actions'

export type ServiceItem = {
  id: string
  title: string
  slug: string
  description: string
  features: string[]
  category: string
  icon: string | null
  ctaLabel: string | null
  whatsappMessage: string | null
  showOnHomepage: boolean
  sortOrder: number
  isActive: boolean
}

const btn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--line)',
  color: '#aac0d5',
  borderRadius: 5,
  padding: '4px 8px',
  fontSize: 11,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}
const dangerBtn: React.CSSProperties = { ...btn, border: '1px solid rgba(240,163,163,.3)', color: '#f0a3a3' }

function ServiceIconPicker({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [selected, setSelected] = useState(defaultValue)
  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, maxHeight: 180, overflowY: 'auto', padding: 8, border: '1px solid var(--line)', borderRadius: 8, background: 'rgba(2,8,23,.4)' }}>
        <button
          type="button"
          onClick={() => setSelected('')}
          title="No icon (auto)"
          style={{ ...btn, justifyContent: 'center', padding: '8px 0', borderColor: !selected ? 'var(--cyan)' : 'var(--line)', color: !selected ? 'var(--cyan)' : '#8aa0b8' }}
        >
          Auto
        </button>
        {Object.entries(ICON_OPTIONS).map(([iconName, Icon]) => (
          <button
            key={iconName}
            type="button"
            onClick={() => setSelected(iconName)}
            title={iconName}
            style={{
              ...btn,
              justifyContent: 'center',
              padding: '8px 0',
              borderColor: selected === iconName ? 'var(--cyan)' : 'var(--line)',
              color: selected === iconName ? 'var(--cyan)' : '#8aa0b8',
              background: selected === iconName ? 'rgba(0,200,255,.08)' : 'transparent',
            }}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
      {selected && <p style={{ margin: '6px 0 0', fontSize: 10, color: '#5f7a99' }}>Selected: {selected}</p>}
    </div>
  )
}

export function ServiceManager({ items, iconOptions }: { items: ServiceItem[]; iconOptions: string[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((s) =>
      [s.title, s.slug, s.description, s.category].join(' ').toLowerCase().includes(q),
    )
  }, [items, query])

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
        <h2 style={{ fontSize: 15, margin: 0, flex: 1 }}>Services ({filtered.length}{filtered.length !== items.length ? ` of ${items.length}` : ''})</h2>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            style={{ ...inputStyle, width: 220, paddingLeft: 30, fontSize: 12 }}
          />
        </div>
        <button style={{ ...btn, color: 'var(--cyan)', borderColor: 'rgba(0,200,255,.35)' }} onClick={() => { setAdding((v) => !v); setEditingId(null) }}>
          <Plus size={12} /> Add service
        </button>
      </div>

      {adding && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(0,140,255,.04)' }}>
          <ServiceForm iconOptions={iconOptions} onDone={() => { setAdding(false); router.refresh() }} />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState text={items.length === 0 ? 'No services yet — add your first one.' : 'No services match your search.'} />
      ) : (
        filtered.map((s, i) => (
          <div key={s.id} style={{ borderBottom: '1px solid rgba(148,163,184,.08)', padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{s.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>/services/{s.slug}{s.category ? ` · ${s.category}` : ''}</p>
              </div>
              {s.showOnHomepage && <Badge tone="cyan"><Star size={9} style={{ marginRight: 3 }} />Homepage</Badge>}
              <Badge tone={s.isActive ? 'green' : 'slate'}>{s.isActive ? 'Active' : 'Hidden'}</Badge>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={btn} disabled={pending || i === 0} title="Move up"
                  onClick={() => run(moveServiceAction, { id: s.id, dir: 'up' })}><ArrowUp size={11} /></button>
                <button style={btn} disabled={pending || i === filtered.length - 1} title="Move down"
                  onClick={() => run(moveServiceAction, { id: s.id, dir: 'down' })}><ArrowDown size={11} /></button>
                <button style={btn} disabled={pending} onClick={() => run(toggleServiceAction, { id: s.id })}>
                  {s.isActive ? 'Disable' : 'Enable'}
                </button>
                <button style={btn} onClick={() => { setEditingId(editingId === s.id ? null : s.id); setAdding(false) }}>
                  <Pencil size={11} /> Edit
                </button>
                <button style={dangerBtn} disabled={pending}
                  onClick={() => { if (confirm(`Delete "${s.title}"? This cannot be undone.`)) run(deleteServiceAction, { id: s.id }) }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            {s.description && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#8aa0b8', lineHeight: 1.5 }}>{s.description}</p>}
            {editingId === s.id && (
              <div style={{ marginTop: 12 }}>
                <ServiceForm service={s} iconOptions={iconOptions} onDone={() => { setEditingId(null); router.refresh() }} />
              </div>
            )}
          </div>
        ))
      )}
    </Card>
  )
}

export function ServiceForm({
  service,
  onDone,
}: {
  service?: ServiceItem
  iconOptions?: string[]
  onDone: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(async () => {
          await saveServiceAction(fd)
          onDone()
          router.refresh()
        })
      }}
    >
      {service && <input type="hidden" name="id" value={service.id} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Title<input name="title" required defaultValue={service?.title} placeholder="Web Development" style={inputStyle} /></label>
        <label style={labelStyle}>Slug<input name="slug" required defaultValue={service?.slug} placeholder="web-development" style={inputStyle} /></label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Category<input name="category" defaultValue={service?.category} placeholder="Web" style={inputStyle} /></label>
        <div style={labelStyle}>
          Icon
          <ServiceIconPicker name="icon" defaultValue={service?.icon ?? ''} />
        </div>
        <label style={labelStyle}>Button label<input name="ctaLabel" defaultValue={service?.ctaLabel ?? ''} placeholder="Learn more" style={inputStyle} /></label>
      </div>
      <label style={labelStyle}>Description<textarea name="description" rows={2} defaultValue={service?.description} style={{ ...inputStyle, resize: 'vertical' }} /></label>
      <label style={labelStyle}>Features (one per line)<textarea name="features" rows={4} defaultValue={service?.features.join('\n')} placeholder={'Fast delivery\nMobile responsive\nSEO ready'} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }} /></label>
      <label style={labelStyle}>WhatsApp inquiry message (optional — adds a WhatsApp button)<input name="whatsappMessage" defaultValue={service?.whatsappMessage ?? ''} placeholder="Hi! I'm interested in Web Development." style={inputStyle} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Sort order<input name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} style={inputStyle} /></label>
        <label style={labelStyle}>Active
          <select name="isActive" defaultValue={service ? String(service.isActive) : 'true'} style={inputStyle}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label style={{ ...labelStyle, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 8, textTransform: 'none', fontSize: 12 }}>
          <input type="checkbox" name="showOnHomepage" value="true" defaultChecked={service?.showOnHomepage ?? false} /> Show on homepage
        </label>
      </div>
      <button className="button primary" type="submit" disabled={pending} style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
        {pending ? 'Saving…' : service ? 'Save service' : 'Add service'}
      </button>
    </form>
  )
}
