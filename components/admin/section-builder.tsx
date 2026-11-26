'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import {
  SECTION_TYPES,
  defaultContentFor,
  getSectionTypeDef,
  type FieldDef,
} from '@/lib/section-schema'
import {
  createSectionObj,
  deleteSectionObj,
  duplicateSectionObj,
  reorderSectionsObj,
  updateSectionObj,
} from '@/app/admin/(panel)/actions'

export type BuilderSection = {
  id: string
  sectionType: string
  content: Record<string, unknown>
  sortOrder: number
  isVisible: boolean
}

export type MediaOption = { id: string; label: string }

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#091a31',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '9px 12px',
  color: 'white',
  font: 'inherit',
  fontSize: 13,
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  color: '#aac0d5',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

export function SectionBuilder({
  pageId,
  pageSlug,
  pageStatus,
  initialSections,
  mediaOptions = [],
}: {
  pageId: string
  pageSlug: string
  pageStatus: string
  initialSections: BuilderSection[]
  mediaOptions?: MediaOption[]
}) {
  const router = useRouter()
  const [sections, setSections] = useState<BuilderSection[]>(initialSections)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingType, setAddingType] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const editing = sections.find((s) => s.id === editingId) ?? null

  function reorder(local: BuilderSection[]) {
    return local.map((s, i) => ({ ...s, sortOrder: i }))
  }

  function move(id: string, dir: -1 | 1) {
    const index = sections.findIndex((s) => s.id === id)
    const target = index + dir
    if (index < 0 || target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[index], next[target]] = [next[target], next[index]]
    const reordered = reorder(next)
    setSections(reordered)
    startTransition(async () => {
      await reorderSectionsObj(pageId, reordered.map((s) => s.id))
      router.refresh()
    })
  }

  function onDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const next = [...sections]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    const reordered = reorder(next)
    setSections(reordered)
    setDragIndex(null)
    setOverIndex(null)
    startTransition(async () => {
      await reorderSectionsObj(pageId, reordered.map((s) => s.id))
      router.refresh()
    })
  }

  function toggleVisible(section: BuilderSection) {
    const next = sections.map((s) => (s.id === section.id ? { ...s, isVisible: !s.isVisible } : s))
    setSections(next)
    startTransition(async () => {
      await updateSectionObj(section.id, section.content, !section.isVisible)
      router.refresh()
    })
  }

  function duplicate(section: BuilderSection) {
    startTransition(async () => {
      const result = await duplicateSectionObj(section.id)
      if (result?.id) {
        const copy: BuilderSection = { ...section, id: result.id, sortOrder: sections.length }
        setSections((prev) => [...prev, copy])
        router.refresh()
      }
    })
  }

  function remove(section: BuilderSection) {
    if (!window.confirm(`Delete the "${getSectionTypeDef(section.sectionType).label}" section? This cannot be undone.`)) return
    setSections((prev) => prev.filter((s) => s.id !== section.id))
    if (editingId === section.id) setEditingId(null)
    startTransition(async () => {
      await deleteSectionObj(section.id)
      router.refresh()
    })
  }

  function addSection() {
    if (!addingType) return
    const def = getSectionTypeDef(addingType)
    startTransition(async () => {
      const result = await createSectionObj(pageId, def.type, defaultContentFor(def.type))
      if (result?.id) {
        const created: BuilderSection = {
          id: result.id,
          sectionType: def.type,
          content: defaultContentFor(def.type),
          sortOrder: sections.length,
          isVisible: true,
        }
        setSections((prev) => [...prev, created])
        setEditingId(result.id)
        setAddingType('')
        router.refresh()
      }
    })
  }

  function saveSection(id: string, content: Record<string, unknown>, isVisible: boolean) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content, isVisible } : s)))
    startTransition(async () => {
      await updateSectionObj(id, content, isVisible)
      setMessage('Section saved.')
      setTimeout(() => setMessage(''), 2500)
      router.refresh()
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: editing ? 'minmax(0,1fr) 460px' : '1fr', gap: 20, alignItems: 'start' }} className="builder-grid">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={addingType} onChange={(e) => setAddingType(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="">Add a section…</option>
              {SECTION_TYPES.map((t) => (
                <option key={t.type} value={t.type}>{t.label}</option>
              ))}
            </select>
            <button className="button primary" onClick={addSection} disabled={!addingType || pending} style={{ padding: '10px 16px', fontSize: 12 }}>
              {pending ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Add</>}
            </button>
          </div>
          <a
            href={`/admin/preview?slug=${encodeURIComponent(pageSlug)}`}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: 'auto', color: 'var(--cyan)', fontSize: 12, display: 'inline-flex', gap: 6, alignItems: 'center' }}
          >
            <Eye size={14} /> Preview page ({pageStatus})
          </a>
          {message && <span style={{ color: '#70e6ac', fontSize: 12 }}>{message}</span>}
        </div>

        {sections.length === 0 && (
          <div style={{ border: '1px dashed var(--line)', borderRadius: 10, padding: '48px 24px', textAlign: 'center', color: '#5f7a99' }}>
            No sections yet. Add your first section above — the page will render it on the frontend once published.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map((section, index) => {
            const def = getSectionTypeDef(section.sectionType)
            const title = typeof section.content.title === 'string' ? section.content.title : ''
            const isDragging = dragIndex === index
            const isOver = overIndex === index && dragIndex !== null && dragIndex !== index
            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => { e.preventDefault(); setOverIndex(index) }}
                onDragLeave={() => setOverIndex(null)}
                onDrop={() => onDrop(index)}
                onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: `1px solid ${isOver ? 'var(--cyan)' : 'var(--line)'}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  background: isDragging ? 'rgba(0,200,255,.06)' : 'rgba(7,21,43,.6)',
                  cursor: 'grab',
                  opacity: isDragging ? 0.5 : 1,
                }}
              >
                <GripVertical size={16} style={{ color: '#5f7a99', flexShrink: 0 }} />
                <span style={{ color: '#5f7a99', fontSize: 11, width: 22, textAlign: 'center' }}>{index + 1}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 13, color: 'white' }}>{def.label}</strong>
                    <span style={{ fontSize: 10, color: '#5f7a99', textTransform: 'uppercase', letterSpacing: 1 }}>{section.sectionType}</span>
                    {!section.isVisible && <span style={{ fontSize: 10, color: '#f3ca47', border: '1px solid rgba(228,184,62,.3)', borderRadius: 99, padding: '2px 8px' }}>Hidden</span>}
                  </div>
                  {title && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#8aa0b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <IconBtn title="Move up" onClick={() => move(section.id, -1)} disabled={index === 0}><ArrowUp size={14} /></IconBtn>
                  <IconBtn title="Move down" onClick={() => move(section.id, 1)} disabled={index === sections.length - 1}><ArrowDown size={14} /></IconBtn>
                  <IconBtn title={section.isVisible ? 'Hide section' : 'Show section'} onClick={() => toggleVisible(section)}>
                    {section.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </IconBtn>
                  <IconBtn title="Duplicate" onClick={() => duplicate(section)}><Copy size={14} /></IconBtn>
                  <IconBtn title="Edit" onClick={() => setEditingId(section.id)} active={editingId === section.id}><PencilIcon /></IconBtn>
                  <IconBtn title="Delete" onClick={() => remove(section)} danger><Trash2 size={14} /></IconBtn>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editing && (
        <SectionEditor
          key={editing.id}
          section={editing}
          mediaOptions={mediaOptions}
          onClose={() => setEditingId(null)}
          onSave={(content, isVisible) => saveSection(editing.id, content, isVisible)}
        />
      )}

      <style>{`
        @media (max-width: 1100px) {
          .builder-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
  danger,
  active,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 6,
        border: `1px solid ${active ? 'var(--cyan)' : 'var(--line)'}`,
        background: active ? 'rgba(0,200,255,.1)' : 'transparent',
        color: danger ? '#f0a3a3' : active ? 'var(--cyan)' : '#8aa0b8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  )
}

function SectionEditor({
  section,
  mediaOptions,
  onClose,
  onSave,
}: {
  section: BuilderSection
  mediaOptions: MediaOption[]
  onClose: () => void
  onSave: (content: Record<string, unknown>, isVisible: boolean) => void
}) {
  const def = getSectionTypeDef(section.sectionType)
  const [content, setContent] = useState<Record<string, unknown>>({ ...section.content })
  const [visible, setVisible] = useState(section.isVisible)
  const [saving, startSave] = useTransition()

  function setField(key: string, value: unknown) {
    setContent((prev) => ({ ...prev, [key]: value }))
  }

  function renderField(field: FieldDef) {
    const value = content[field.key]
    switch (field.kind) {
      case 'textarea':
        return (
          <textarea
            rows={3}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => setField(field.key, e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        )
      case 'lines':
        return (
          <textarea
            rows={4}
            value={Array.isArray(value) ? (value as string[]).join('\n') : typeof value === 'string' ? value : ''}
            onChange={(e) => setField(field.key, e.target.value.split('\n'))}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
          />
        )
      case 'image':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mediaOptions.length > 0 && (
              <select
                value=""
                onChange={(e) => e.target.value && setField(field.key, `/api/img/${e.target.value}`)}
                style={{ ...inputStyle, fontSize: 12, color: '#8aa0b8' }}
              >
                <option value="">Choose from media library…</option>
                {mediaOptions.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            )}
            <input
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => setField(field.key, e.target.value)}
              placeholder="https://… or /api/img/…"
              style={inputStyle}
            />
            {typeof value === 'string' && value && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="preview" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
            )}
          </div>
        )
      case 'select':
        return (
          <select value={typeof value === 'string' ? value : field.options?.[0]?.value ?? ''} onChange={(e) => setField(field.key, e.target.value)} style={inputStyle}>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )
      case 'items':
        return (
          <ItemsEditor
            items={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
            itemFields={field.itemFields ?? []}
            mediaOptions={mediaOptions}
            onChange={(items) => setField(field.key, items)}
          />
        )
      default:
        return (
          <input
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            onChange={(e) => setField(field.key, e.target.value)}
            style={inputStyle}
          />
        )
    }
  }

  return (
    <aside
      style={{
        position: 'sticky',
        top: 84,
        border: '1px solid var(--line)',
        borderRadius: 12,
        background: 'linear-gradient(160deg, rgba(18,33,57,.85), rgba(4,13,29,.9))',
        padding: 20,
        maxHeight: 'calc(100vh - 110px)',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 4 }}>{def.label} section</p>
          <p style={{ margin: 0, fontSize: 11, color: '#5f7a99' }}>{def.description}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close editor" style={{ background: 'none', border: 'none', color: '#8aa0b8', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
        {def.fields.map((field) => (
          <label key={field.key} style={labelStyle}>
            {field.label}
            {renderField(field)}
            {field.help && <span style={{ color: '#5f7a99', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>{field.help}</span>}
          </label>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#aac0d5', fontSize: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Section visible on the page
        </label>

        <div style={{ display: 'flex', gap: 10, position: 'sticky', bottom: 0, paddingTop: 10, background: 'inherit' }}>
          <button
            className="button primary"
            onClick={() => startSave(() => onSave(content, visible))}
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /> Save section</>}
          </button>
          <button className="button" onClick={onClose} style={{ border: '1px solid var(--line)', color: '#aac0d5', background: 'transparent' }}>
            Cancel
          </button>
        </div>
      </div>
    </aside>
  )
}

function ItemsEditor({
  items,
  itemFields,
  mediaOptions = [],
  onChange,
}: {
  items: Record<string, unknown>[]
  itemFields: NonNullable<FieldDef['itemFields']>
  mediaOptions?: MediaOption[]
  onChange: (items: Record<string, unknown>[]) => void
}) {
  function update(index: number, key: string, value: unknown) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  function addItem() {
    const blank: Record<string, unknown> = {}
    for (const f of itemFields) blank[f.key] = f.kind === 'lines' ? [] : ''
    onChange([...items, blank])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, index) => (
        <div key={index} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(2,8,23,.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#5f7a99', fontWeight: 700 }}>Item {index + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              style={{ background: 'none', border: 'none', color: '#f0a3a3', cursor: 'pointer', fontSize: 11 }}
            >
              Remove
            </button>
          </div>
          {itemFields.map((f) => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ color: '#8aa0b8', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</span>
              {f.kind === 'textarea' ? (
                <textarea
                  rows={2}
                  value={typeof item[f.key] === 'string' ? (item[f.key] as string) : ''}
                  onChange={(e) => update(index, f.key, e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical', fontSize: 12 }}
                />
              ) : f.kind === 'lines' ? (
                <textarea
                  rows={3}
                  value={Array.isArray(item[f.key]) ? (item[f.key] as string[]).join('\n') : typeof item[f.key] === 'string' ? (item[f.key] as string) : ''}
                  onChange={(e) => update(index, f.key, e.target.value.split('\n'))}
                  placeholder={f.placeholder}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 11 }}
                />
              ) : f.kind === 'image' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {mediaOptions.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => e.target.value && update(index, f.key, `/api/img/${e.target.value}`)}
                      style={{ ...inputStyle, fontSize: 11, color: '#8aa0b8' }}
                    >
                      <option value="">Choose from media library…</option>
                      {mediaOptions.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  )}
                  <input
                    value={typeof item[f.key] === 'string' ? (item[f.key] as string) : ''}
                    onChange={(e) => update(index, f.key, e.target.value)}
                    placeholder="https://… or /api/img/…"
                    style={{ ...inputStyle, fontSize: 12 }}
                  />
                  {typeof item[f.key] === 'string' && (item[f.key] as string) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item[f.key] as string} alt="" style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }} />
                  )}
                </div>
              ) : (
                <input
                  value={typeof item[f.key] === 'string' || typeof item[f.key] === 'number' ? String(item[f.key]) : ''}
                  onChange={(e) => update(index, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={{ ...inputStyle, fontSize: 12 }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px dashed var(--line)', color: 'var(--cyan)', borderRadius: 6, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}
      >
        + Add item
      </button>
    </div>
  )
}
