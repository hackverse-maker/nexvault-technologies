import Link from 'next/link'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pages, sections } from '@/lib/db/schema'
import { PageHeader, Card, Badge, EmptyState, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { createSectionAction, deleteSectionAction, toggleSectionAction, updateSectionAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sections — NexVault Admin' }

const SECTION_TYPES = [
  'hero', 'features', 'services_grid', 'work_grid', 'pricing', 'testimonials',
  'faq', 'contact', 'cta', 'stats', 'team', 'gallery', 'blog_grid', 'text',
]

export default async function AdminSectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageSlug } = await searchParams
  const allPages = await db.query.pages.findMany({ orderBy: [asc(pages.title)] })
  const selected = allPages.find((p) => p.slug === pageSlug) ?? allPages[0]

  const pageSections = selected
    ? await db.query.sections.findMany({
        where: eq(sections.pageId, selected.id),
        orderBy: [asc(sections.sortOrder)],
      })
    : []

  return (
    <>
      <PageHeader title="Section Management" description="Organize and edit the content sections that make up each page.">
        {selected && (
          <Link href={`/admin/builder?slug=${selected.slug}`} style={{ color: 'var(--cyan)', fontSize: 12, border: '1px solid rgba(0,200,255,.4)', borderRadius: 6, padding: '8px 14px' }}>
            Open visual builder →
          </Link>
        )}
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
        {allPages.map((p) => (
          <Link
            key={p.id}
            href={`/admin/sections?page=${p.slug}`}
            style={{
              padding: '8px 14px',
              borderRadius: 99,
              fontSize: 12,
              border: '1px solid var(--line)',
              background: selected?.id === p.id ? 'rgba(0,200,255,.12)' : 'transparent',
              color: selected?.id === p.id ? 'var(--cyan)' : '#8aa0b8',
            }}
          >
            {p.title}
          </Link>
        ))}
        {allPages.length === 0 && <p style={{ color: '#5f7a99', fontSize: 13 }}>Create pages first in Pages Management.</p>}
      </div>

      {selected && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
          <Card>
            <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Sections on “{selected.title}” ({pageSections.length})</h2>
            {selected.status !== 'published' && (
              <p style={{ color: '#f3ca47', fontSize: 12, margin: '0 0 14px' }}>
                This page is {selected.status} — it is not publicly accessible until published.
              </p>
            )}
            {pageSections.length === 0 ? (
              <EmptyState text="No sections yet. Add one below." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pageSections.map((section) => (
                  <div key={section.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#5f7a99', fontSize: 11 }}>#{section.sortOrder}</span>
                        <Badge tone="cyan">{section.sectionType.replace(/_/g, ' ')}</Badge>
                        <Badge tone={section.isVisible ? 'green' : 'slate'}>{section.isVisible ? 'Visible' : 'Hidden'}</Badge>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <form action={toggleSectionAction}>
                          <input type="hidden" name="id" value={section.id} />
                          <input type="hidden" name="isVisible" value={String(!section.isVisible)} />
                          <button type="submit" style={miniBtn}>{section.isVisible ? 'Hide' : 'Show'}</button>
                        </form>
                        <form action={deleteSectionAction}>
                          <input type="hidden" name="id" value={section.id} />
                          <button type="submit" style={{ ...miniBtn, color: '#f0a3a3', borderColor: 'rgba(240,163,163,.3)' }}>Delete</button>
                        </form>
                      </div>
                    </div>
                    <details style={{ marginTop: 10 }}>
                      <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit content (JSON)</summary>
                      <form action={updateSectionAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                        <input type="hidden" name="id" value={section.id} />
                        <textarea
                          name="content"
                          rows={8}
                          defaultValue={JSON.stringify(section.content ?? {}, null, 2)}
                          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11, resize: 'vertical' }}
                        />
                        <input type="hidden" name="isVisible" value={String(section.isVisible)} />
                        <button className="button primary" type="submit" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 14px' }}>Save content</button>
                      </form>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Add section</h2>
            <form action={createSectionAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="hidden" name="pageId" value={selected.id} />
              <label style={labelStyle}>Section type
                <select name="sectionType" required style={inputStyle}>
                  {SECTION_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label style={labelStyle}>Content (JSON, optional)
                <textarea
                  name="content"
                  rows={7}
                  placeholder={'{\n  "eyebrow": "What we do",\n  "title": "How we can help",\n  "text": "…",\n  "items": [{"title": "…", "description": "…"}]\n}'}
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11, resize: 'vertical' }}
                />
              </label>
              <p style={{ color: '#5f7a99', fontSize: 11, margin: 0 }}>
                Sections render on the live page using keys like eyebrow, title, text, items, image, ctaLabel, ctaHref. See the section renderer for supported fields per type.
              </p>
              <button className="button primary" type="submit" style={{ alignSelf: 'flex-start' }}>Add section</button>
            </form>
          </Card>
        </div>
      )}
    </>
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
