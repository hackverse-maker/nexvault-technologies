'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { Badge, Card, EmptyState, inputStyle, labelStyle } from './ui'
import {
  deleteProductAction,
  moveProductAction,
  saveProductAction,
  toggleProductAction,
} from '@/app/admin/(panel)/actions'

export type ProductItem = {
  id: string
  name: string
  slug: string
  description: string
  price: string
  comparePrice: string | null
  currency: string
  features: string[]
  category: string
  ctaLabel: string | null
  whatsappMessage: string | null
  showOnHomepage: boolean
  isPopular: boolean
  mediaId: string | null
  status: string
  sortOrder: number
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
const statusTone = { active: 'green', draft: 'amber', archived: 'slate' } as const

export function ProductManager({
  items,
  mediaOptions,
}: {
  items: ProductItem[]
  mediaOptions: { id: string; label: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) =>
      [p.name, p.slug, p.description, p.category].join(' ').toLowerCase().includes(q),
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
        <h2 style={{ fontSize: 15, margin: 0, flex: 1 }}>Products ({filtered.length}{filtered.length !== items.length ? ` of ${items.length}` : ''})</h2>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            style={{ ...inputStyle, width: 220, paddingLeft: 30, fontSize: 12 }}
          />
        </div>
        <button style={{ ...btn, color: 'var(--cyan)', borderColor: 'rgba(0,200,255,.35)' }} onClick={() => { setAdding((v) => !v); setEditingId(null) }}>
          <Plus size={12} /> Add product
        </button>
      </div>

      {adding && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(0,140,255,.04)' }}>
          <ProductForm mediaOptions={mediaOptions} onDone={() => { setAdding(false); router.refresh() }} />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState text={items.length === 0 ? 'No products yet — add your first one.' : 'No products match your search.'} />
      ) : (
        filtered.map((p, i) => (
          <div key={p.id} style={{ borderBottom: '1px solid rgba(148,163,184,.08)', padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>
                  /{p.slug} · {p.currency} {Number(p.price).toLocaleString()}{p.category ? ` · ${p.category}` : ''}
                </p>
              </div>
              {p.showOnHomepage && <Badge tone="cyan"><Star size={9} style={{ marginRight: 3 }} />Homepage</Badge>}
              <Badge tone={statusTone[p.status as keyof typeof statusTone] ?? 'slate'}>{p.status}</Badge>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={btn} disabled={pending || i === 0} title="Move up"
                  onClick={() => run(moveProductAction, { id: p.id, dir: 'up' })}><ArrowUp size={11} /></button>
                <button style={btn} disabled={pending || i === filtered.length - 1} title="Move down"
                  onClick={() => run(moveProductAction, { id: p.id, dir: 'down' })}><ArrowDown size={11} /></button>
                <button style={btn} disabled={pending} onClick={() => run(toggleProductAction, { id: p.id })}>
                  {p.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button style={btn} onClick={() => { setEditingId(editingId === p.id ? null : p.id); setAdding(false) }}>
                  <Pencil size={11} /> Edit
                </button>
                <button style={dangerBtn} disabled={pending}
                  onClick={() => { if (confirm(`Delete "${p.name}"? This cannot be undone.`)) run(deleteProductAction, { id: p.id }) }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            {p.description && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#8aa0b8', lineHeight: 1.5 }}>{p.description}</p>}
            {editingId === p.id && (
              <div style={{ marginTop: 12 }}>
                <ProductForm product={p} mediaOptions={mediaOptions} onDone={() => { setEditingId(null); router.refresh() }} />
              </div>
            )}
          </div>
        ))
      )}
    </Card>
  )
}

export function ProductForm({
  product,
  mediaOptions = [],
  onDone,
}: {
  product?: ProductItem
  mediaOptions?: { id: string; label: string }[]
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
          await saveProductAction(fd)
          onDone()
          router.refresh()
        })
      }}
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Name<input name="name" required defaultValue={product?.name} placeholder="Gold Package" style={inputStyle} /></label>
        <label style={labelStyle}>Slug<input name="slug" required defaultValue={product?.slug} placeholder="gold-package" style={inputStyle} /></label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Category<input name="category" defaultValue={product?.category} placeholder="website-package" style={inputStyle} /></label>
        <label style={labelStyle}>Button label<input name="ctaLabel" defaultValue={product?.ctaLabel ?? ''} placeholder="Get started" style={inputStyle} /></label>
        <label style={labelStyle}>Status
          <select name="status" defaultValue={product?.status ?? 'draft'} style={inputStyle}>
            <option value="draft">Draft (disabled)</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <label style={labelStyle}>Description<textarea name="description" rows={2} defaultValue={product?.description} placeholder="What this product includes" style={{ ...inputStyle, resize: 'vertical' }} /></label>
      <label style={labelStyle}>Features (one per line)<textarea name="features" rows={4} defaultValue={product?.features.join('\n')} placeholder={'Responsive website\nSEO setup\n3 revisions'} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Price<input name="price" type="number" step="0.01" min={0} required defaultValue={product?.price} placeholder="26991" style={inputStyle} /></label>
        <label style={labelStyle}>Compare price (optional)<input name="comparePrice" type="number" step="0.01" min={0} defaultValue={product?.comparePrice ?? ''} placeholder="39991" style={inputStyle} /></label>
        <label style={labelStyle}>Currency<input name="currency" defaultValue={product?.currency ?? 'PKR'} placeholder="PKR" style={inputStyle} /></label>
      </div>
      <label style={labelStyle}>WhatsApp inquiry message (optional — adds a WhatsApp button)<input name="whatsappMessage" defaultValue={product?.whatsappMessage ?? ''} placeholder="Hi! I'd like to ask about Gold Package." style={inputStyle} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Sort order<input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} style={inputStyle} /></label>
        <label style={labelStyle}>Product image
          <select name="mediaId" defaultValue={product?.mediaId ?? ''} style={inputStyle}>
            <option value="">— No image —</option>
            {mediaOptions.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          {mediaOptions.length === 0 && <span style={{ color: '#5f7a99', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>Upload images in Media Library first.</span>}
        </label>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 8, textTransform: 'none', fontSize: 12 }}>
          <input type="checkbox" name="showOnHomepage" value="true" defaultChecked={product?.showOnHomepage ?? false} /> Show on homepage
        </label>
        <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 8, textTransform: 'none', fontSize: 12 }}>
          <input type="checkbox" name="isPopular" value="true" defaultChecked={product?.isPopular ?? false} /> Mark as popular plan
        </label>
      </div>
      <button className="button primary" type="submit" disabled={pending} style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
        {pending ? 'Saving…' : product ? 'Save product' : 'Add product'}
      </button>
    </form>
  )
}
