import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mediaLibrary, pages, websiteSettings } from '@/lib/db/schema'
import { PageHeader, Card, Badge, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { updatePageAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'SEO — NexVault Admin' }

export default async function AdminSeoPage() {
  const allPages = await db.query.pages.findMany({ orderBy: [asc(pages.title)] })
  const settings = await db.query.websiteSettings.findFirst()
  const media = await db.query.mediaLibrary.findMany({ orderBy: [asc(mediaLibrary.originalName)] })
  const mediaOptions = media.map((m) => ({ id: m.id, label: m.originalName, url: `/api/img/${m.id}` }))

  return (
    <>
      <PageHeader title="SEO Management" description="Per-page search titles and descriptions, plus site-wide defaults." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, marginBottom: 22 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 6px' }}>Site defaults</h2>
          <p style={{ color: '#5f7a99', fontSize: 12, margin: '0 0 16px' }}>
            Used when a page has no custom SEO values.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid rgba(148,163,184,.08)', paddingBottom: 10 }}>
              <span style={{ color: '#8aa0b8' }}>Default title</span>
              <span style={{ color: 'white', textAlign: 'right', maxWidth: 280 }}>{settings?.defaultSeoTitle || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid rgba(148,163,184,.08)', paddingBottom: 10 }}>
              <span style={{ color: '#8aa0b8' }}>Default description</span>
              <span style={{ color: 'white', textAlign: 'right', maxWidth: 280 }}>{settings?.defaultSeoDescription || '—'}</span>
            </div>
            <p style={{ color: '#5f7a99', fontSize: 11, margin: '6px 0 0' }}>
              Edit defaults under <a href="/admin/settings" style={{ color: 'var(--cyan)' }}>Global Website Settings</a>.
            </p>
          </div>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Pages ({allPages.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Page', 'SEO title', 'SEO description', 'OG image', 'Status', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {allPages.map((page) => (
                  <tr key={page.id}>
                    <td style={tdStyle}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{page.title}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>/{page.slug}</p>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 200 }}>
                      <p style={{ margin: 0, fontSize: 12, color: '#b7c6d6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.seoTitle || '—'}</p>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 240 }}>
                      <p style={{ margin: 0, fontSize: 12, color: '#8aa0b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.seoDescription || '—'}</p>
                    </td>
                    <td style={tdStyle}>
                      {page.ogImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={page.ogImage} alt="" style={{ width: 72, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--line)' }} />
                      ) : (
                        <span style={{ color: '#5f7a99', fontSize: 11 }}>Default</span>
                      )}
                    </td>
                    <td style={tdStyle}><Badge tone={page.status === 'published' ? 'green' : page.status === 'draft' ? 'amber' : 'slate'}>{page.status}</Badge></td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <details>
                        <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit SEO</summary>
                        <form action={updatePageAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minWidth: 280 }}>
                          <input type="hidden" name="id" value={page.id} />
                          <input type="hidden" name="title" value={page.title} />
                          <input type="hidden" name="status" value={page.status} />
                          <label style={labelStyle}>Slug<input name="slug" defaultValue={page.slug} style={inputStyle} /></label>
                          <input name="seoTitle" defaultValue={page.seoTitle ?? ''} placeholder="SEO title (max ~60 chars)" style={inputStyle} />
                          <textarea name="seoDescription" rows={2} defaultValue={page.seoDescription ?? ''} placeholder="SEO description (max ~160 chars)" style={{ ...inputStyle, resize: 'vertical' }} />
                          <label style={labelStyle}>Social sharing image (OG)
                            <select name="ogImage" defaultValue={page.ogImage ?? ''} style={inputStyle}>
                              <option value="">— Default —</option>
                              {mediaOptions.map((m) => <option key={m.id} value={m.url}>{m.label}</option>)}
                            </select>
                          </label>
                          <button className="button primary" type="submit" style={{ fontSize: 12, padding: '10px 14px' }}>Save SEO</button>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
                {allPages.length === 0 && (
                  <tr><td style={tdStyle} colSpan={6}>No pages yet — create them in Pages Management.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
