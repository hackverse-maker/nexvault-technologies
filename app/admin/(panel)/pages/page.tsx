import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pages, sections } from '@/lib/db/schema'
import { PageHeader, Card, Badge, EmptyState, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { createPageAction, updatePageAction, deletePageAction, duplicatePageAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pages — NexVault Admin' }

const statusTone = { published: 'green', draft: 'amber', archived: 'slate' } as const

export default async function AdminPagesPage() {
  const allPages = await db.query.pages.findMany({ orderBy: [desc(pages.updatedAt)] })
  const sectionRows = await db.select({ pageId: sections.pageId }).from(sections)
  const countFor = (id: string) => sectionRows.filter((s) => s.pageId === id).length

  return (
    <>
      <PageHeader
        title="Pages Management"
        description="Create, edit, publish, duplicate, and delete website pages. Published pages are live on the frontend at /{slug}."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, marginBottom: 26 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>New page</h2>
          <form action={createPageAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Title<input name="title" required placeholder="About Us" style={inputStyle} /></label>
            <label style={labelStyle}>Slug<input name="slug" required placeholder="about-us" style={inputStyle} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={labelStyle}>Status
                <select name="status" defaultValue="draft" style={inputStyle}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label style={labelStyle}>SEO title<input name="seoTitle" placeholder="Page title tag" style={inputStyle} /></label>
            </div>
            <label style={labelStyle}>SEO description<textarea name="seoDescription" rows={2} placeholder="Meta description" style={{ ...inputStyle, resize: 'vertical' }} /></label>
            <button className="button primary" type="submit" style={{ alignSelf: 'flex-start' }}>Create page</button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>All pages ({allPages.length})</h2>
          {allPages.length === 0 ? (
            <EmptyState text="No pages in the database yet." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Page', 'Status', 'Sections', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {allPages.map((page) => (
                    <tr key={page.id}>
                      <td style={tdStyle}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{page.title}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>/{page.slug}</p>
                        <details style={{ marginTop: 8 }}>
                          <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                          <form action={updatePageAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minWidth: 280 }}>
                            <input type="hidden" name="id" value={page.id} />
                            <input name="title" defaultValue={page.title} placeholder="Title" style={inputStyle} />
                            <input name="slug" defaultValue={page.slug} placeholder="slug" style={inputStyle} />
                            <select name="status" defaultValue={page.status} style={inputStyle}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                            <input name="seoTitle" defaultValue={page.seoTitle ?? ''} placeholder="SEO title" style={inputStyle} />
                            <input name="seoDescription" defaultValue={page.seoDescription ?? ''} placeholder="SEO description" style={inputStyle} />
                            <button className="button primary" type="submit" style={{ fontSize: 12, padding: '10px 14px' }}>Save</button>
                          </form>
                        </details>
                      </td>
                      <td style={tdStyle}>
                        <Badge tone={statusTone[page.status as keyof typeof statusTone] ?? 'slate'}>{page.status}</Badge>
                        {page.status === 'published' && (
                          <a href={`/${page.slug}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 6, fontSize: 10, color: 'var(--cyan)' }}>
                            View live ↗
                          </a>
                        )}
                      </td>
                      <td style={tdStyle}>{countFor(page.id)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                          {page.status !== 'published' ? (
                            <StatusForm id={page.id} page={page} status="published" label="Publish" tone="green" />
                          ) : (
                            <StatusForm id={page.id} page={page} status="draft" label="Unpublish" tone="amber" />
                          )}
                          <form action={duplicatePageAction}>
                            <input type="hidden" name="id" value={page.id} />
                            <button type="submit" style={miniBtn}>Duplicate</button>
                          </form>
                          <form action={deletePageAction}>
                            <input type="hidden" name="id" value={page.id} />
                            <button type="submit" style={{ ...miniBtn, color: '#f0a3a3', borderColor: 'rgba(240,163,163,.3)' }}>Delete</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function StatusForm({
  id,
  page,
  status,
  label,
  tone,
}: {
  id: string
  page: { title: string; slug: string; seoTitle: string | null; seoDescription: string | null }
  status: string
  label: string
  tone: 'green' | 'amber'
}) {
  return (
    <form action={updatePageAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="title" value={page.title} />
      <input type="hidden" name="slug" value={page.slug} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="seoTitle" value={page.seoTitle ?? ''} />
      <input type="hidden" name="seoDescription" value={page.seoDescription ?? ''} />
      <button type="submit" style={{ ...miniBtn, color: tone === 'green' ? '#70e6ac' : '#f3ca47', borderColor: tone === 'green' ? 'rgba(71,226,165,.3)' : 'rgba(228,184,62,.3)' }}>
        {label}
      </button>
    </form>
  )
}

const miniBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--line)',
  color: '#aac0d5',
  borderRadius: 5,
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
}
