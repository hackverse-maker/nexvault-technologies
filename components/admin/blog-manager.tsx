'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Badge, Card, EmptyState, inputStyle, labelStyle, tdStyle, thStyle } from './ui'
import { deleteBlogPostAction, saveBlogPostAction } from '@/app/admin/(panel)/actions'

export type BlogSection = { heading: string; paragraphs: string[] }

export type BlogPostItem = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  image: string | null
  content: BlogSection[]
  tags: string[]
  readTime: string | null
  status: string
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string
  updatedAt: string
}

const statusTone = { published: 'green', draft: 'amber' } as const

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

export function BlogManager({ items, mediaOptions = [] }: { items: BlogPostItem[]; mediaOptions?: { id: string; label: string }[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [editing, setEditing] = useState<BlogPostItem | 'new' | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = items.filter((p) => {
    if (status !== 'all' && p.status !== status) return false
    const q = query.trim().toLowerCase()
    return !q || [p.title, p.slug, p.category, p.excerpt].join(' ').toLowerCase().includes(q)
  })

  function run(fn: (fd: FormData) => Promise<unknown>, fields: Record<string, string>) {
    startTransition(async () => {
      const fd = new FormData()
      for (const [k, v] of Object.entries(fields)) fd.set(k, v)
      await fn(fd)
      router.refresh()
    })
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts…" style={{ ...inputStyle, paddingLeft: 30, fontSize: 12 }} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, width: 'auto', fontSize: 12 }}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button className="button primary" onClick={() => setEditing('new')} style={{ padding: '10px 16px', fontSize: 12 }}>
          <Plus size={14} /> New post
        </button>
      </div>

      {editing && (
        <PostEditor
          key={editing === 'new' ? 'new' : editing.id}
          post={editing === 'new' ? null : editing}
          mediaOptions={mediaOptions}
          onClose={() => setEditing(null)}
        />
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState text={items.length === 0 ? 'No blog posts yet — create your first article.' : 'No posts match your filters.'} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Post', 'Category', 'Status', 'Updated', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={tdStyle}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{p.title}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>/blog/{p.slug}</p>
                    </td>
                    <td style={tdStyle}><span style={{ fontSize: 12, color: '#8aa0b8' }}>{p.category}</span></td>
                    <td style={tdStyle}><Badge tone={statusTone[p.status as keyof typeof statusTone] ?? 'slate'}>{p.status}</Badge></td>
                    <td style={{ ...tdStyle, fontSize: 11, color: '#5f7a99', whiteSpace: 'nowrap' }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {p.status === 'published' && (
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" style={{ ...smallBtn, textDecoration: 'none' }}>
                            <ExternalLink size={11} /> View
                          </a>
                        )}
                        <button style={smallBtn} onClick={() => setEditing(p)}><Pencil size={11} /> Edit</button>
                        <button style={{ ...smallBtn, color: '#f0a3a3', borderColor: 'rgba(240,163,163,.3)' }} disabled={pending}
                          onClick={() => { if (confirm(`Delete "${p.title}"? This cannot be undone.`)) run(deleteBlogPostAction, { id: p.id }) }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

function PostEditor({ post, mediaOptions, onClose }: { post: BlogPostItem | null; mediaOptions: { id: string; label: string }[]; onClose: () => void }) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [autoSlug, setAutoSlug] = useState(!post)
  const [sections, setSections] = useState<BlogSection[]>(post?.content?.length ? post.content : [{ heading: '', paragraphs: [''] }])
  const [image, setImage] = useState(post?.image ?? '')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    const finalSlug = (autoSlug ? slugify(title) : slug).trim()
    if (!finalSlug) { setError('Slug is required.'); return }
    const fd = new FormData(e.currentTarget)
    fd.set('id', post?.id ?? '')
    fd.set('slug', finalSlug)
    fd.set('content', JSON.stringify(sections.filter((s) => s.heading.trim() || s.paragraphs.some((p) => p.trim()))))
    startTransition(async () => {
      await saveBlogPostAction(fd)
      router.refresh()
      onClose()
    })
  }

  const updSection = (i: number, patch: Partial<BlogSection>) =>
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  return (
    <Card style={{ marginBottom: 20, borderColor: 'rgba(0,200,255,.35)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, margin: 0 }}>{post ? 'Edit post' : 'New post'}</h2>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#8aa0b8', cursor: 'pointer' }}><X size={18} /></button>
      </div>

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input type="hidden" name="id" value={post?.id ?? ''} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <label style={labelStyle}>Title *
            <input name="title" required value={title} onChange={(e) => { setTitle(e.target.value); if (autoSlug) setSlug(slugify(e.target.value)) }} style={inputStyle} />
          </label>
          <label style={labelStyle}>URL slug
            <input name="slug" value={autoSlug ? slugify(title) : slug} onChange={(e) => { setAutoSlug(false); setSlug(e.target.value) }} style={inputStyle} />
          </label>
          <label style={labelStyle}>Category
            <input name="category" defaultValue={post?.category ?? 'Journal'} placeholder="e.g. Web Development" style={inputStyle} />
          </label>
          <label style={labelStyle}>Read time
            <input name="readTime" defaultValue={post?.readTime ?? ''} placeholder="e.g. 5 min read" style={inputStyle} />
          </label>
        </div>

        <label style={labelStyle}>Excerpt
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''} placeholder="Short summary shown on cards and in search results" style={{ ...inputStyle, resize: 'vertical' }} />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <label style={labelStyle}>Featured image
            <select value="" onChange={(e) => e.target.value && setImage(`/api/img/${e.target.value}`)} style={{ ...inputStyle, fontSize: 12, color: '#8aa0b8' }}>
              <option value="">Choose from media library…</option>
              {mediaOptions.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://… or /api/img/…" style={{ ...inputStyle, marginTop: 6 }} />
            {image && <img src={image} alt="Featured" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', marginTop: 6 }} />}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Tags (comma separated)
              <input name="tags" defaultValue={post?.tags?.join(', ') ?? ''} placeholder="seo, web, growth" style={inputStyle} />
            </label>
            <label style={labelStyle}>Publish date
              <input name="publishedAt" type="date" defaultValue={post?.publishedAt ?? ''} style={inputStyle} />
            </label>
            <label style={labelStyle}>Status
              <select name="status" defaultValue={post?.status ?? 'draft'} style={inputStyle}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
            </label>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ margin: 0, color: '#aac0d5', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Article sections</p>
            <button type="button" className="button" onClick={() => setSections((p) => [...p, { heading: '', paragraphs: [''] }])} style={{ fontSize: 11, padding: '7px 12px', border: '1px solid var(--line)', background: 'transparent', color: '#aac0d5' }}>
              <Plus size={12} /> Add section
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sections.map((s, i) => (
              <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 14, background: 'rgba(2,8,23,.4)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={s.heading} onChange={(e) => updSection(i, { heading: e.target.value })} placeholder={`Section ${i + 1} heading`} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => setSections((p) => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#f0a3a3', cursor: 'pointer', fontSize: 11 }}>Remove</button>
                </div>
                <textarea
                  rows={4}
                  value={s.paragraphs.join('\n')}
                  onChange={(e) => updSection(i, { paragraphs: e.target.value.split('\n') })}
                  placeholder="Paragraphs — one per line"
                  style={{ ...inputStyle, resize: 'vertical', fontSize: 12 }}
                />
              </div>
            ))}
          </div>
        </div>

        <details>
          <summary style={{ color: 'var(--cyan)', fontSize: 12, cursor: 'pointer' }}>SEO settings (optional)</summary>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <label style={labelStyle}>SEO title<input name="seoTitle" defaultValue={post?.seoTitle ?? ''} style={inputStyle} /></label>
            <label style={labelStyle}>SEO description<input name="seoDescription" defaultValue={post?.seoDescription ?? ''} style={inputStyle} /></label>
          </div>
        </details>

        {error && <p style={{ color: '#f0a3a3', fontSize: 12, margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button primary" type="submit" disabled={pending} style={{ padding: '11px 20px', fontSize: 13 }}>
            {pending ? <Loader2 size={15} className="animate-spin" /> : 'Save post'}
          </button>
          <button type="button" className="button" onClick={onClose} style={{ border: '1px solid var(--line)', background: 'transparent', color: '#aac0d5' }}>Cancel</button>
        </div>
      </form>
    </Card>
  )
}
