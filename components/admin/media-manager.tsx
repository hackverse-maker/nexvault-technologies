'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { Card, inputStyle, labelStyle } from '@/components/admin/ui'
import { MAX_UPLOAD_BYTES, isAllowedMimeType, mediaImagePath } from '@/lib/media'
import {
  assignMediaAction,
  deleteHeroSlideAction,
  deleteMediaAction,
  deleteSliderAction,
  deleteSliderSlideAction,
  moveHeroSlideAction,
  moveSliderSlideAction,
  registerExternalMediaAction,
  registerUploadedMediaAction,
  replaceMediaAction,
  saveHeroSlideAction,
  saveSliderAction,
  saveSliderSlideAction,
  toggleHeroSlideAction,
  toggleSliderSlideAction,
  unassignMediaAction,
  updateMediaAction,
} from '@/app/admin/(panel)/media/actions'

export type MediaAsset = {
  id: string
  publicUrl: string
  objectKey: string
  storageProvider: string
  originalName: string
  mimeType: string
  byteSize: number
  width: number | null
  height: number | null
  altText: string
  caption: string
  folder: string
  tags: string[]
  createdAt: string
}

export type MediaAssignment = {
  id: string
  mediaId: string
  targetType: string
  targetId: string | null
  role: string
}

export type SlideRecord = {
  id: string
  mediaId: string | null
  title: string
  subtitle?: string
  caption?: string
  ctaLabel: string
  ctaHref: string
  sortOrder: number
  isVisible: boolean
}

export type SliderRecord = {
  id: string
  name: string
  slug: string
  description: string
  pageId: string | null
  isVisible: boolean
  slides: SlideRecord[]
}

export type NamedOption = { id: string; label: string }

type Props = {
  assets: MediaAsset[]
  assignments: MediaAssignment[]
  heroSlides: SlideRecord[]
  sliders: SliderRecord[]
  pages: NamedOption[]
  products: NamedOption[]
  services: NamedOption[]
  sections: NamedOption[]
  uploadConfigured: boolean
}

const TARGET_TYPES = [
  { value: 'page', label: 'Page' },
  { value: 'section', label: 'Section' },
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' },
  { value: 'header', label: 'Header' },
  { value: 'footer', label: 'Footer' },
  { value: 'website', label: 'Website (global)' },
] as const

const ASSIGN_ROLES = ['image', 'logo', 'hero', 'banner', 'gallery', 'icon', 'background'] as const

type AssignTarget = 'page' | 'section' | 'product' | 'service' | 'header' | 'footer' | 'website'

const imgBtn: React.CSSProperties = {
  background: 'rgba(7,21,43,.8)',
  border: '1px solid var(--line)',
  color: '#aac0d5',
  borderRadius: 5,
  padding: '4px 9px',
  fontSize: 10,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

const dangerBtn: React.CSSProperties = {
  ...imgBtn,
  color: '#f0a3a3',
  border: '1px solid rgba(240,163,163,.3)',
}

function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function MediaManager(props: Props) {
  const { assets, assignments, heroSlides, sliders, pages, products, services, sections, uploadConfigured } = props
  const router = useRouter()
  const [tab, setTab] = useState<'library' | 'hero' | 'sliders'>('library')
  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState('')
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [replacingId, setReplacingId] = useState<string | null>(null)
  const [showExternal, setShowExternal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const folders = useMemo(() => {
    const set = new Set(assets.map((a) => a.folder))
    return Array.from(set).sort()
  }, [assets])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return assets.filter((a) => {
      if (folder && a.folder !== folder) return false
      if (!q) return true
      return (
        a.originalName.toLowerCase().includes(q) ||
        a.altText.toLowerCase().includes(q) ||
        a.caption.toLowerCase().includes(q) ||
        a.folder.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [assets, query, folder])

  function flash(text: string, error = false) {
    setMessage({ text, error })
    setTimeout(() => setMessage(null), 4000)
  }

  async function uploadFile(file: File, altText = ''): Promise<string | null> {
    if (!isAllowedMimeType(file.type)) {
      flash(`Unsupported file type "${file.type || 'unknown'}". Use JPEG, PNG, WebP, GIF, or AVIF.`, true)
      return null
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      flash(`File is too large (${fmtBytes(file.size)}). Maximum is ${fmtBytes(MAX_UPLOAD_BYTES)}.`, true)
      return null
    }
    setBusy(true)
    try {
      const dims = await readImageSize(file)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80)
      const result = await upload(`media/${Date.now()}-${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: () => {},
      })
      const registered = await registerUploadedMediaAction({
        publicUrl: result.url,
        objectKey: result.pathname,
        originalName: file.name,
        mimeType: result.contentType || file.type,
        byteSize: file.size,
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        altText,
      })
      if (registered && 'error' in registered && registered.error) {
        flash(registered.error, true)
        return null
      }
      flash('Upload complete.')
      router.refresh()
      return result.url
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Upload failed', true)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function handleReplace(file: File, asset: MediaAsset) {
    if (!isAllowedMimeType(file.type)) {
      flash(`Unsupported file type "${file.type || 'unknown'}".`, true)
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      flash(`File is too large. Maximum is ${fmtBytes(MAX_UPLOAD_BYTES)}.`, true)
      return
    }
    setBusy(true)
    try {
      const dims = await readImageSize(file)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80)
      const result = await upload(`media/${Date.now()}-${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      const res = await replaceMediaAction({
        id: asset.id,
        publicUrl: result.url,
        objectKey: result.pathname,
        originalName: file.name,
        mimeType: result.contentType || file.type,
        byteSize: file.size,
        width: dims?.width ?? asset.width,
        height: dims?.height ?? asset.height,
        altText: asset.altText,
        folder: asset.folder,
        tags: asset.tags,
      })
      if (res && 'error' in res && res.error) {
        flash(res.error, true)
      } else {
        flash('Image replaced.')
        router.refresh()
      }
    } catch (error) {
      flash(error instanceof Error ? error.message : 'Replacement failed', true)
    } finally {
      setBusy(false)
      setReplacingId(null)
    }
  }

  function targetOptions(type: string): NamedOption[] {
    switch (type) {
      case 'page':
        return pages
      case 'product':
        return products
      case 'service':
        return services
      case 'section':
        return sections
      default:
        return []
    }
  }

  const tabs = [
    { id: 'library' as const, label: `Library (${assets.length})` },
    { id: 'hero' as const, label: `Hero banners (${heroSlides.length})` },
    { id: 'sliders' as const, label: `Sliders (${sliders.length})` },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 99,
              fontSize: 12,
              border: '1px solid var(--line)',
              background: tab === t.id ? 'rgba(0,200,255,.12)' : 'transparent',
              color: tab === t.id ? 'var(--cyan)' : '#8aa0b8',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
        {message && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: message.error ? '#f0a3a3' : '#70e6ac' }}>{message.text}</span>
        )}
      </div>

      {tab === 'library' && (
        <>
          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <label style={{ ...labelStyle, flex: '1 1 240px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Search size={12} /> Search</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, alt text, folder, tag…" style={inputStyle} />
              </label>
              <label style={{ ...labelStyle, minWidth: 160 }}>
                Folder
                <select value={folder} onChange={(e) => setFolder(e.target.value)} style={inputStyle}>
                  <option value="">All folders</option>
                  {folders.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadFile(file)
                    e.target.value = ''
                  }}
                />
                <button
                  className="button primary"
                  disabled={busy || !uploadConfigured}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 12, padding: '10px 16px' }}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload image
                </button>
                <button className="button" onClick={() => setShowExternal((v) => !v)} style={{ fontSize: 12, padding: '10px 16px', border: '1px solid var(--line)', background: 'transparent', color: '#aac0d5' }}>
                  <Link2 size={14} style={{ display: 'inline', marginRight: 6 }} /> External URL
                </button>
              </div>
            </div>
            {!uploadConfigured && (
              <p style={{ color: '#f3ca47', fontSize: 12, margin: '12px 0 0' }}>
                BLOB_READ_WRITE_TOKEN is not configured — uploads are disabled. Set it in your environment to enable direct uploads.
              </p>
            )}
            {showExternal && <ExternalUrlForm onDone={() => { setShowExternal(false); router.refresh() }} />}
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <p style={{ color: '#5f7a99', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
                {assets.length === 0 ? 'No media yet — upload your first image above.' : 'No assets match your search.'}
              </p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
              {filtered.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  assignments={assignments.filter((a) => a.mediaId === asset.id)}
                  pages={pages}
                  products={products}
                  services={services}
                  sections={sections}
                  editing={editingId === asset.id}
                  assigning={assigningId === asset.id}
                  replacing={replacingId === asset.id}
                  onEdit={() => setEditingId(editingId === asset.id ? null : asset.id)}
                  onAssign={() => setAssigningId(assigningId === asset.id ? null : asset.id)}
                  onReplace={() => {
                    setReplacingId(asset.id)
                    setTimeout(() => replaceInputRef.current?.click(), 0)
                  }}
                  onDelete={() => {
                    if (!window.confirm(`Delete "${asset.originalName}"? This removes the file from storage.`)) return
                    startTransition(async () => {
                      await deleteMediaAction(asset.id)
                      router.refresh()
                    })
                  }}
                  onSaved={() => {
                    setEditingId(null)
                    router.refresh()
                  }}
                  onAssigned={() => {
                    setAssigningId(null)
                    router.refresh()
                  }}
                />
              ))}
            </div>
          )}

          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              const asset = assets.find((a) => a.id === replacingId)
              if (file && asset) void handleReplace(file, asset)
              e.target.value = ''
            }}
          />
        </>
      )}

      {tab === 'hero' && <HeroSlidesPanel slides={heroSlides} assets={assets} onChanged={() => router.refresh()} />}
      {tab === 'sliders' && (
        <SlidersPanel
          sliders={sliders}
          assets={assets}
          pages={pages}
          onChanged={() => router.refresh()}
        />
      )}

      <style>{`
        .mm-card { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: rgba(7,21,43,.5); display: flex; flex-direction: column; }
        .mm-thumb { width: 100%; height: 130px; object-fit: cover; display: block; background: #091a31; }
        .mm-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .mm-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 6px; }
        .mm-field { display: flex; flex-direction: column; gap: 5px; }
        .mm-label { color: #8aa0b8; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
      `}</style>
    </div>
  )
}

// ---------- Library card ----------

function AssetCard({
  asset,
  assignments,
  pages,
  products,
  services,
  sections,
  editing,
  assigning,
  replacing,
  onEdit,
  onAssign,
  onReplace,
  onDelete,
  onSaved,
  onAssigned,
}: {
  asset: MediaAsset
  assignments: MediaAssignment[]
  pages: NamedOption[]
  products: NamedOption[]
  services: NamedOption[]
  sections: NamedOption[]
  editing: boolean
  assigning: boolean
  replacing: boolean
  onEdit: () => void
  onAssign: () => void
  onReplace: () => void
  onDelete: () => void
  onSaved: () => void
  onAssigned: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    altText: asset.altText,
    caption: asset.caption,
    folder: asset.folder,
    tags: asset.tags.join(', '),
  })
  const [assignForm, setAssignForm] = useState<{ targetType: AssignTarget; targetId: string; role: string }>({ targetType: 'page', targetId: '', role: 'image' })
  const siteUrl = mediaImagePath(asset.id)

  const targetOptions =
    assignForm.targetType === 'page' ? pages
    : assignForm.targetType === 'product' ? products
    : assignForm.targetType === 'service' ? services
    : assignForm.targetType === 'section' ? sections
    : []

  return (
    <div className="mm-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mm-thumb" src={`${mediaImagePath(asset.id)}?w=400`} alt={asset.altText || asset.originalName} loading="lazy" />
      <div className="mm-body">
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#d7e4f2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={asset.originalName}>
          {asset.originalName}
        </p>
        <p style={{ margin: 0, fontSize: 10, color: '#5f7a99' }}>
          {asset.mimeType.replace('image/', '').toUpperCase()} · {fmtBytes(asset.byteSize)}
          {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
        </p>
        <p style={{ margin: 0, fontSize: 10, color: '#5f7a99' }}>
          <span style={{ color: 'var(--cyan)' }}>{asset.folder}</span>
          {asset.storageProvider === 'external' ? ' · external' : ''}
          {assignments.length > 0 ? ` · ${assignments.length} assignment${assignments.length > 1 ? 's' : ''}` : ''}
        </p>

        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 0', borderTop: '1px solid var(--line)' }}>
            <label className="mm-field"><span className="mm-label">Alt text</span>
              <input style={{ ...inputStyle, fontSize: 12, padding: '7px 10px' }} value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} /></label>
            <label className="mm-field"><span className="mm-label">Caption</span>
              <input style={{ ...inputStyle, fontSize: 12, padding: '7px 10px' }} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label className="mm-field"><span className="mm-label">Folder</span>
                <input style={{ ...inputStyle, fontSize: 12, padding: '7px 10px' }} value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })} placeholder="general" /></label>
              <label className="mm-field"><span className="mm-label">Tags (comma separated)</span>
                <input style={{ ...inputStyle, fontSize: 12, padding: '7px 10px' }} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label>
            </div>
            <button
              className="button primary"
              style={{ fontSize: 11, padding: '8px 12px', alignSelf: 'flex-start' }}
              disabled={pending}
              onClick={() => startTransition(async () => {
                await updateMediaAction({
                  id: asset.id,
                  altText: form.altText,
                  caption: form.caption,
                  folder: form.folder,
                  tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
                })
                onSaved()
              })}
            >
              Save details
            </button>
          </div>
        )}

        {assigning && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 0', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label className="mm-field"><span className="mm-label">Assign to</span>
                <select style={{ ...inputStyle, fontSize: 12, padding: '7px 10px' }} value={assignForm.targetType}
                  onChange={(e) => setAssignForm({ ...assignForm, targetType: e.target.value as AssignTarget, targetId: '' })}>
                  {TARGET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select></label>
              <label className="mm-field"><span className="mm-label">Specific item</span>
                <select style={{ ...inputStyle, fontSize: 12, padding: '7px 10px' }} value={assignForm.targetId}
                  onChange={(e) => setAssignForm({ ...assignForm, targetId: e.target.value })}
                  disabled={targetOptions.length === 0}>
                  <option value="">{targetOptions.length === 0 ? '—' : 'Select…'}</option>
                  {targetOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select></label>
            </div>
            <label className="mm-field"><span className="mm-label">Role</span>
              <select style={{ ...inputStyle, fontSize: 12, padding: '7px 10px' }} value={assignForm.role}
                onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}>
                {ASSIGN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select></label>
            <button
              className="button primary"
              style={{ fontSize: 11, padding: '8px 12px', alignSelf: 'flex-start' }}
              disabled={pending}
              onClick={() => startTransition(async () => {
                await assignMediaAction({
                  mediaId: asset.id,
                  targetType: assignForm.targetType,
                  targetId: assignForm.targetId || null,
                  role: assignForm.role,
                })
                onAssigned()
              })}
            >
              Save assignment
            </button>
            {assignments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {assignments.map((a) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#8aa0b8' }}>
                    <span style={{ flex: 1 }}>{a.targetType}{a.targetId ? ` · ${a.targetId.slice(0, 8)}…` : ''} · {a.role}</span>
                    <button style={{ ...dangerBtn, padding: '2px 7px' }} onClick={() => startTransition(async () => { await unassignMediaAction(a.id); onAssigned() })}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mm-actions">
          <button style={imgBtn} onClick={onEdit} title="Edit alt text, folder, tags"><Pencil size={11} /> Edit</button>
          <button style={imgBtn} onClick={onAssign} title="Assign to page/section/product/service"><Link2 size={11} /> Assign</button>
          <button style={imgBtn} onClick={onReplace} disabled={replacing} title="Replace file">
            {replacing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />} Replace
          </button>
          <button style={imgBtn} onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${siteUrl}`)} title="Copy site URL">
            <Copy size={11} /> URL
          </button>
          <a style={imgBtn} href={asset.publicUrl} target="_blank" rel="noreferrer" title="Open original"><ExternalLink size={11} /></a>
          <button style={dangerBtn} onClick={onDelete} disabled={pending} title="Delete"><Trash2 size={11} /></button>
        </div>
      </div>
    </div>
  )
}

// ---------- External URL registration ----------

function ExternalUrlForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [form, setForm] = useState({ publicUrl: '', altText: '', folder: 'stock' })

  return (
    <form
      style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}
      onSubmit={(e) => {
        e.preventDefault()
        setError('')
        startTransition(async () => {
          const res = await registerExternalMediaAction({
            publicUrl: form.publicUrl,
            altText: form.altText,
            folder: form.folder,
            byteSize: 1, // size is unknown for remote URLs; metadata is best-effort
            mimeType: 'image/jpeg',
          })
          if (res && 'error' in res && res.error) setError(res.error)
          else onDone()
        })
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
        <label className="mm-field"><span className="mm-label">Image URL</span>
          <input required type="url" style={{ ...inputStyle, fontSize: 12 }} value={form.publicUrl} onChange={(e) => setForm({ ...form, publicUrl: e.target.value })} placeholder="https://images.unsplash.com/…" /></label>
        <label className="mm-field"><span className="mm-label">Alt text</span>
          <input style={{ ...inputStyle, fontSize: 12 }} value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} /></label>
        <label className="mm-field"><span className="mm-label">Folder</span>
          <input style={{ ...inputStyle, fontSize: 12 }} value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })} /></label>
      </div>
      {error && <p style={{ color: '#f0a3a3', fontSize: 12, margin: 0 }}>{error}</p>}
      <button className="button primary" type="submit" disabled={pending} style={{ alignSelf: 'flex-start', fontSize: 12, padding: '9px 16px' }}>
        {pending ? 'Registering…' : 'Register external image'}
      </button>
    </form>
  )
}

// ---------- Hero slides ----------

type SlideFormState = { mediaId: string; title: string; subtitle: string; caption: string; ctaLabel: string; ctaHref: string }

const EMPTY_SLIDE_FORM: SlideFormState = { mediaId: '', title: '', subtitle: '', caption: '', ctaLabel: '', ctaHref: '' }

function HeroSlidesPanel({ slides, assets, onChanged }: { slides: SlideRecord[]; assets: MediaAsset[]; onChanged: () => void }) {
  const [pending, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<SlideFormState>({ ...EMPTY_SLIDE_FORM })

  const mediaName = (id: string | null) => assets.find((a) => a.id === id)?.originalName ?? 'No image'

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 15, margin: '0 0 4px' }}>Homepage hero banners</h2>
          <p style={{ color: '#5f7a99', fontSize: 12, margin: 0 }}>Slides rotate behind the homepage hero content. Order matters — first slide shows first.</p>
        </div>
        <button className="button primary" style={{ fontSize: 12, padding: '9px 16px' }} onClick={() => setAdding((v) => !v)}>
          <Plus size={14} style={{ display: 'inline', marginRight: 5 }} /> Add slide
        </button>
      </div>

      {adding && (
        <SlideForm
          assets={assets}
          form={form}
          setForm={setForm}
          pending={pending}
          submitLabel="Add slide"
          onSubmit={() => startTransition(async () => {
            await saveHeroSlideAction({ ...form, sortOrder: slides.length })
            setForm({ ...EMPTY_SLIDE_FORM })
            setAdding(false)
            onChanged()
          })}
          onCancel={() => setAdding(false)}
        />
      )}

      {slides.length === 0 && !adding && (
        <p style={{ color: '#5f7a99', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No hero slides yet. The homepage shows its default design until you add slides.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {slides.map((slide, index) => (
          <HeroSlideRow
            key={slide.id}
            slide={slide}
            index={index}
            total={slides.length}
            assets={assets}
            mediaName={mediaName}
            onChanged={onChanged}
          />
        ))}
      </div>
    </Card>
  )
}

function HeroSlideRow({
  slide,
  index,
  total,
  assets,
  mediaName,
  onChanged,
}: {
  slide: SlideRecord
  index: number
  total: number
  assets: MediaAsset[]
  mediaName: (id: string | null) => string
  onChanged: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<SlideFormState>({
    mediaId: slide.mediaId ?? '',
    title: slide.title,
    subtitle: slide.subtitle ?? '',
    caption: slide.caption ?? '',
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref,
  })

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 12, display: 'flex', gap: 14, alignItems: 'flex-start', background: 'rgba(2,8,23,.4)' }}>
      <div style={{ width: 120, height: 70, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#091a31', position: 'relative' }}>
        {slide.mediaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${mediaImagePath(slide.mediaId)}?w=240`} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5f7a99', fontSize: 10 }}>No image</div>
        )}
        <span style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 99 }}>{index + 1}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <SlideForm
            assets={assets}
            form={form}
            setForm={setForm}
            pending={pending}
            submitLabel="Save slide"
            onSubmit={() => startTransition(async () => {
              await saveHeroSlideAction({ id: slide.id, ...form })
              setEditing(false)
              onChanged()
            })}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#d7e4f2' }}>{slide.title || '(untitled)'}</p>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8aa0b8' }}>
              {mediaName(slide.mediaId)}
              {slide.subtitle ? ` · ${slide.subtitle}` : ''}
              {slide.ctaLabel ? ` · CTA: ${slide.ctaLabel} → ${slide.ctaHref}` : ''}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: slide.isVisible ? '#70e6ac' : '#f3ca47' }}>{slide.isVisible ? 'Visible' : 'Hidden'}</p>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {!editing && (
          <>
            <button style={imgBtn} disabled={index === 0 || pending} title="Move up" onClick={() => startTransition(async () => { await moveHeroSlideAction(slide.id, -1); onChanged() })}><ArrowUp size={12} /></button>
            <button style={imgBtn} disabled={index === total - 1 || pending} title="Move down" onClick={() => startTransition(async () => { await moveHeroSlideAction(slide.id, 1); onChanged() })}><ArrowDown size={12} /></button>
            <button style={imgBtn} title={slide.isVisible ? 'Hide' : 'Show'} onClick={() => startTransition(async () => { await toggleHeroSlideAction(slide.id, !slide.isVisible); onChanged() })}>
              {slide.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button style={imgBtn} title="Edit" onClick={() => setEditing(true)}><Pencil size={12} /></button>
            <button style={dangerBtn} title="Delete" disabled={pending} onClick={() => {
              if (!window.confirm('Delete this hero slide?')) return
              startTransition(async () => { await deleteHeroSlideAction(slide.id); onChanged() })
            }}><Trash2 size={12} /></button>
          </>
        )}
      </div>
    </div>
  )
}

function SlideForm({
  assets,
  form,
  setForm,
  pending,
  submitLabel,
  captionMode = false,
  onSubmit,
  onCancel,
}: {
  assets: MediaAsset[]
  form: SlideFormState
  setForm: (f: SlideFormState) => void
  pending: boolean
  submitLabel: string
  captionMode?: boolean
  onSubmit: () => void
  onCancel: () => void
}) {
  const input = { ...inputStyle, fontSize: 12, padding: '8px 10px' }
  const secondaryValue = captionMode ? form.caption : form.subtitle
  const setSecondary = (v: string) => setForm(captionMode ? { ...form, caption: v } : { ...form, subtitle: v })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '8px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label className="mm-field"><span className="mm-label">Background image</span>
          <select style={input} value={form.mediaId} onChange={(e) => setForm({ ...form, mediaId: e.target.value })}>
            <option value="">— No image —</option>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.originalName}</option>)}
          </select></label>
        <label className="mm-field"><span className="mm-label">Title / eyebrow</span>
          <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Optional overlay text" /></label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <label className="mm-field"><span className="mm-label">{captionMode ? 'Caption' : 'Subtitle'}</span>
          <input style={input} value={secondaryValue} onChange={(e) => setSecondary(e.target.value)} /></label>
        <label className="mm-field"><span className="mm-label">Button label</span>
          <input style={input} value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Get a quote" /></label>
        <label className="mm-field"><span className="mm-label">Button URL</span>
          <input style={input} value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} placeholder="/get-a-quote" /></label>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="button primary" style={{ fontSize: 11, padding: '8px 14px' }} disabled={pending} onClick={onSubmit}>{submitLabel}</button>
        <button className="button" style={{ fontSize: 11, padding: '8px 14px', border: '1px solid var(--line)', background: 'transparent', color: '#aac0d5' }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ---------- Sliders ----------

function SlidersPanel({ sliders, assets, pages, onChanged }: { sliders: SliderRecord[]; assets: MediaAsset[]; pages: NamedOption[]; onChanged: () => void }) {
  const [pending, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', pageId: '' })
  const [openId, setOpenId] = useState<string | null>(sliders[0]?.id ?? null)

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 15, margin: '0 0 4px' }}>Image sliders</h2>
          <p style={{ color: '#5f7a99', fontSize: 12, margin: 0 }}>Reusable sliders. Add a &quot;Image slider&quot; section to a page and pick the slider by slug.</p>
        </div>
        <button className="button primary" style={{ fontSize: 12, padding: '9px 16px' }} onClick={() => setAdding((v) => !v)}>
          <Plus size={14} style={{ display: 'inline', marginRight: 5 }} /> New slider
        </button>
      </div>

      {adding && (
        <form
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 14, padding: 12, border: '1px solid var(--line)', borderRadius: 8 }}
          onSubmit={(e) => {
            e.preventDefault()
            startTransition(async () => {
              await saveSliderAction({ name: form.name, description: form.description, pageId: form.pageId || null })
              setForm({ name: '', description: '', pageId: '' })
              setAdding(false)
              onChanged()
            })
          }}
        >
          <input required placeholder="Slider name" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Description (optional)" style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select style={inputStyle} value={form.pageId} onChange={(e) => setForm({ ...form, pageId: e.target.value })}>
            <option value="">No page assigned</option>
            {pages.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <button className="button primary" type="submit" disabled={pending || !form.name.trim()} style={{ fontSize: 12, padding: '9px 16px' }}>Create</button>
        </form>
      )}

      {sliders.length === 0 && !adding && (
        <p style={{ color: '#5f7a99', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No sliders yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sliders.map((slider) => (
          <SliderCard
            key={slider.id}
            slider={slider}
            assets={assets}
            pages={pages}
            open={openId === slider.id}
            onToggleOpen={() => setOpenId(openId === slider.id ? null : slider.id)}
            onChanged={onChanged}
          />
        ))}
      </div>
    </Card>
  )
}

function SliderCard({
  slider,
  assets,
  pages,
  open,
  onToggleOpen,
  onChanged,
}: {
  slider: SliderRecord
  assets: MediaAsset[]
  pages: NamedOption[]
  open: boolean
  onToggleOpen: () => void
  onChanged: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [addingSlide, setAddingSlide] = useState(false)
  const [slideForm, setSlideForm] = useState<SlideFormState>({ ...EMPTY_SLIDE_FORM })

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', background: 'rgba(2,8,23,.4)' }}
        onClick={onToggleOpen}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#d7e4f2' }}>{slider.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>
            slug: <code style={{ color: 'var(--cyan)' }}>{slider.slug}</code> · {slider.slides.length} slide{slider.slides.length === 1 ? '' : 's'}
            {slider.isVisible ? '' : ' · hidden'}
          </p>
        </div>
        <button
          style={imgBtn}
          onClick={(e) => {
            e.stopPropagation()
            startTransition(async () => {
              await saveSliderAction({ id: slider.id, name: slider.name, slug: slider.slug, description: slider.description, pageId: slider.pageId, isVisible: !slider.isVisible })
              onChanged()
            })
          }}
        >
          {slider.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          style={dangerBtn}
          onClick={(e) => {
            e.stopPropagation()
            if (!window.confirm(`Delete slider "${slider.name}" and all its slides?`)) return
            startTransition(async () => { await deleteSliderAction(slider.id); onChanged() })
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 0' }}>
            <label className="mm-field"><span className="mm-label">Name</span>
              <input style={inputStyle} defaultValue={slider.name} onBlur={(e) => {
                if (e.target.value !== slider.name) startTransition(async () => {
                  await saveSliderAction({ id: slider.id, name: e.target.value, slug: slider.slug, description: slider.description, pageId: slider.pageId, isVisible: slider.isVisible })
                  onChanged()
                })
              }} /></label>
            <label className="mm-field"><span className="mm-label">Assigned page</span>
              <select style={inputStyle} defaultValue={slider.pageId ?? ''} onChange={(e) => startTransition(async () => {
                await saveSliderAction({ id: slider.id, name: slider.name, slug: slider.slug, description: slider.description, pageId: e.target.value || null, isVisible: slider.isVisible })
                onChanged()
              })}>
                <option value="">None</option>
                {pages.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select></label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 10px' }}>
            <span className="mm-label">Slides</span>
            <button className="button" style={{ fontSize: 11, padding: '7px 12px', border: '1px solid var(--line)', background: 'transparent', color: '#aac0d5' }} onClick={() => setAddingSlide((v) => !v)}>
              <Plus size={12} style={{ display: 'inline', marginRight: 4 }} /> Add slide
            </button>
          </div>

          {addingSlide && (
            <SlideForm
              assets={assets}
              form={slideForm}
              setForm={setSlideForm}
              pending={pending}
              submitLabel="Add slide"
              captionMode
              onSubmit={() => startTransition(async () => {
                await saveSliderSlideAction({ sliderId: slider.id, ...slideForm, sortOrder: slider.slides.length })
                setSlideForm({ ...EMPTY_SLIDE_FORM })
                setAddingSlide(false)
                onChanged()
              })}
              onCancel={() => setAddingSlide(false)}
            />
          )}

          {slider.slides.length === 0 && !addingSlide && (
            <p style={{ color: '#5f7a99', fontSize: 12, padding: '10px 0' }}>No slides yet.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {slider.slides.map((slide, index) => (
              <SliderSlideRow
                key={slide.id}
                slide={slide}
                sliderId={slider.id}
                index={index}
                total={slider.slides.length}
                assets={assets}
                onChanged={onChanged}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SliderSlideRow({
  slide,
  sliderId,
  index,
  total,
  assets,
  onChanged,
}: {
  slide: SlideRecord
  sliderId: string
  index: number
  total: number
  assets: MediaAsset[]
  onChanged: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    mediaId: slide.mediaId ?? '',
    title: slide.title,
    caption: slide.caption ?? '',
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref,
  })
  const asset = assets.find((a) => a.id === slide.mediaId)

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', border: '1px solid rgba(148,163,184,.12)', borderRadius: 6, padding: '8px 10px' }}>
      <span style={{ fontSize: 10, color: '#5f7a99', width: 16, textAlign: 'center' }}>{index + 1}</span>
      <div style={{ width: 72, height: 42, borderRadius: 4, overflow: 'hidden', background: '#091a31', flexShrink: 0 }}>
        {slide.mediaId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${mediaImagePath(slide.mediaId)}?w=160`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: '#8aa0b8' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select style={{ ...inputStyle, fontSize: 11, padding: '6px 8px' }} value={form.mediaId} onChange={(e) => setForm({ ...form, mediaId: e.target.value })}>
                <option value="">— No image —</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.originalName}</option>)}
              </select>
              <input style={{ ...inputStyle, fontSize: 11, padding: '6px 8px' }} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <input style={{ ...inputStyle, fontSize: 11, padding: '6px 8px' }} placeholder="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
              <input style={{ ...inputStyle, fontSize: 11, padding: '6px 8px' }} placeholder="CTA label" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
              <input style={{ ...inputStyle, fontSize: 11, padding: '6px 8px' }} placeholder="CTA URL" value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="button primary" style={{ fontSize: 10, padding: '6px 12px' }} disabled={pending} onClick={() => startTransition(async () => {
                await saveSliderSlideAction({ id: slide.id, sliderId, ...form })
                setEditing(false)
                onChanged()
              })}>Save</button>
              <button className="button" style={{ fontSize: 10, padding: '6px 12px', border: '1px solid var(--line)', background: 'transparent', color: '#aac0d5' }} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <span style={{ color: '#d7e4f2' }}>{slide.title || asset?.originalName || 'Untitled slide'}</span>
            {slide.caption && <span> · {slide.caption}</span>}
            {!slide.isVisible && <span style={{ color: '#f3ca47' }}> · hidden</span>}
          </>
        )}
      </div>
      {!editing && (
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={imgBtn} disabled={index === 0 || pending} onClick={() => startTransition(async () => { await moveSliderSlideAction(slide.id, -1); onChanged() })}><ArrowUp size={11} /></button>
          <button style={imgBtn} disabled={index === total - 1 || pending} onClick={() => startTransition(async () => { await moveSliderSlideAction(slide.id, 1); onChanged() })}><ArrowDown size={11} /></button>
          <button style={imgBtn} onClick={() => startTransition(async () => { await toggleSliderSlideAction(slide.id, !slide.isVisible); onChanged() })}>
            {slide.isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
          <button style={imgBtn} onClick={() => setEditing(true)}><Pencil size={11} /></button>
          <button style={dangerBtn} disabled={pending} onClick={() => {
            if (!window.confirm('Delete this slide?')) return
            startTransition(async () => { await deleteSliderSlideAction(slide.id); onChanged() })
          }}><Trash2 size={11} /></button>
        </div>
      )}
    </div>
  )
}
