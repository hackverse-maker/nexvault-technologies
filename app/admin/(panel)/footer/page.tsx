import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { footerColumns, footerConfiguration, mediaLibrary, navigationItems, pages, socialMediaLinks } from '@/lib/db/schema'
import { PageHeader, Card, Badge, EmptyState, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import {
  saveFooterConfigAction,
  saveNavItemAction,
  deleteNavItemAction,
  moveNavItemAction,
  createFooterColumnAction,
  deleteFooterColumnAction,
  saveSocialLinkAction,
  deleteSocialLinkAction,
} from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Footer — NexVault Admin' }

export default async function AdminFooterPage() {
  const [config, columns, items, allPages, socials, media] = await Promise.all([
    db.query.footerConfiguration.findFirst({ where: eq(footerConfiguration.id, 1) }),
    db.query.footerColumns.findMany({ orderBy: [asc(footerColumns.sortOrder)] }),
    db.query.navigationItems.findMany({
      where: eq(navigationItems.location, 'footer'),
      orderBy: [asc(navigationItems.sortOrder)],
    }),
    db.query.pages.findMany({ orderBy: [asc(pages.title)] }),
    db.query.socialMediaLinks.findMany({ orderBy: [asc(socialMediaLinks.sortOrder)] }),
    db.query.mediaLibrary.findMany({ orderBy: [asc(mediaLibrary.createdAt)] }),
  ])

  const columnTitle = (id: string | null) => columns.find((c) => c.id === id)?.title ?? '—'
  const targetLabel = (item: (typeof items)[number]) => {
    if (item.targetUrl) return item.targetUrl
    const page = allPages.find((p) => p.id === item.targetPageId)
    return page ? `/${page.slug}` : '—'
  }

  return (
    <>
      <PageHeader title="Footer Management" description="Footer content, logo, link columns, social icons, and copyright — live on every page after saving." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, marginBottom: 22 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Footer content</h2>
          <form action={saveFooterConfigAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Heading<input name="heading" defaultValue={config?.heading ?? ''} placeholder="Build. Rank. Grow." style={inputStyle} /></label>
            <label style={labelStyle}>Description<textarea name="description" rows={3} defaultValue={config?.description ?? ''} style={{ ...inputStyle, resize: 'vertical' }} /></label>
            <label style={labelStyle}>Copyright text<input name="copyrightText" defaultValue={config?.copyrightText ?? ''} style={inputStyle} /></label>
            <label style={labelStyle}>Footer logo
              <select name="logoMediaId" defaultValue={config?.logoMediaId ?? ''} style={inputStyle}>
                <option value="">Default NexVault logo</option>
                {media.map((m) => <option key={m.id} value={m.id}>{m.originalName}</option>)}
              </select>
            </label>
            <label style={labelStyle}>Show social links
              <select name="showSocialLinks" defaultValue={config ? String(config.showSocialLinks) : 'true'} style={inputStyle}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <button className="button primary" type="submit" style={{ alignSelf: 'flex-start' }}>Save footer</button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Footer columns ({columns.length})</h2>
          {columns.length === 0 ? (
            <p style={{ color: '#5f7a99', fontSize: 13, marginBottom: 14 }}>No columns yet — footer links will group under a default column.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {columns.map((col) => (
                <div key={col.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{col.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>{items.filter((i) => i.footerColumnId === col.id).length} links</p>
                  </div>
                  <form action={deleteFooterColumnAction}>
                    <input type="hidden" name="id" value={col.id} />
                    <button type="submit" style={dangerBtn}>Delete</button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <form action={createFooterColumnAction} style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
            <label style={{ ...labelStyle, flex: 1 }}>New column title<input name="title" required placeholder="Company" style={inputStyle} /></label>
            <button className="button primary" type="submit" style={{ padding: '10px 16px', fontSize: 12 }}>Add</button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Social icons ({socials.length})</h2>
          {socials.length === 0 ? <EmptyState text="No social links — the footer falls back to defaults." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {socials.map((social) => (
                <div key={social.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{social.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>{social.platform} · order {social.sortOrder}</p>
                    </div>
                    <Badge tone={social.isVisible ? 'green' : 'slate'}>{social.isVisible ? 'Visible' : 'Hidden'}</Badge>
                  </div>
                  <details>
                    <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                    <SocialForm social={social} compact />
                  </details>
                  <form action={deleteSocialLinkAction} style={{ marginTop: 8 }}>
                    <input type="hidden" name="id" value={social.id} />
                    <button type="submit" style={dangerBtn}>Delete</button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <SocialForm />
        </Card>
      </div>

      <Card>
        <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Footer links ({items.length})</h2>
        {items.length === 0 ? (
          <EmptyState text="No footer links yet." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Order', 'Label', 'Target', 'Column', 'Visible', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <form action={moveNavItemAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="location" value="footer" />
                          <input type="hidden" name="dir" value="up" />
                          <button type="submit" disabled={index === 0} style={{ ...miniBtn, padding: '2px 8px' }}>↑</button>
                        </form>
                        <form action={moveNavItemAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="location" value="footer" />
                          <input type="hidden" name="dir" value="down" />
                          <button type="submit" disabled={index === items.length - 1} style={{ ...miniBtn, padding: '2px 8px' }}>↓</button>
                        </form>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {item.label}
                      <details style={{ marginTop: 8 }}>
                        <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                        <FooterLinkForm item={item} allPages={allPages} columns={columns} compact />
                      </details>
                    </td>
                    <td style={tdStyle}><code style={{ fontSize: 11, color: '#70ddff' }}>{targetLabel(item)}</code></td>
                    <td style={tdStyle}>{columnTitle(item.footerColumnId)}</td>
                    <td style={tdStyle}><Badge tone={item.isVisible ? 'green' : 'slate'}>{item.isVisible ? 'Visible' : 'Hidden'}</Badge></td>
                    <td style={tdStyle}>
                      <form action={deleteNavItemAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" style={dangerBtn}>Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 18 }}>
          <FooterLinkForm allPages={allPages} columns={columns} />
        </div>
      </Card>
    </>
  )
}

function FooterLinkForm({
  item,
  allPages,
  columns,
  compact = false,
}: {
  item?: { id: string; label: string; sortOrder: number; isVisible: boolean; targetUrl: string | null; targetPageId: string | null; footerColumnId: string | null }
  allPages: { id: string; title: string; slug: string }[]
  columns: { id: string; title: string }[]
  compact?: boolean
}) {
  return (
    <form
      action={saveNavItemAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: compact ? 10 : 0, minWidth: compact ? 300 : 'auto' }}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="location" value="footer" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Label<input name="label" required defaultValue={item?.label} placeholder="Pricing" style={inputStyle} /></label>
        <label style={labelStyle}>Column
          <select name="footerColumnId" defaultValue={item?.footerColumnId ?? ''} style={inputStyle}>
            <option value="">First column</option>
            {columns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
      </div>
      <label style={labelStyle}>Link to page
        <select name="targetPageId" defaultValue={item?.targetPageId ?? ''} style={inputStyle}>
          <option value="">— custom URL instead —</option>
          {allPages.map((p) => <option key={p.id} value={p.id}>/{p.slug} — {p.title}</option>)}
        </select>
      </label>
      <label style={labelStyle}>…or custom URL<input name="targetUrl" defaultValue={item?.targetUrl ?? ''} placeholder="/contact" style={inputStyle} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Sort order<input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} style={inputStyle} /></label>
        <label style={labelStyle}>Visible
          <select name="isVisible" defaultValue={item ? String(item.isVisible) : 'true'} style={inputStyle}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>
      <button className="button primary" type="submit" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
        {item ? 'Save link' : 'Add footer link'}
      </button>
    </form>
  )
}

function SocialForm({
  social,
  compact = false,
}: {
  social?: { id: string; platform: string; label: string; url: string; sortOrder: number; isVisible: boolean }
  compact?: boolean
}) {
  return (
    <form
      action={saveSocialLinkAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: compact ? 10 : 0, borderTop: compact ? '1px solid var(--line)' : 'none', paddingTop: compact ? 10 : 0 }}
    >
      {social && <input type="hidden" name="id" value={social.id} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Platform<input name="platform" required defaultValue={social?.platform} placeholder="instagram" style={inputStyle} /></label>
        <label style={labelStyle}>Label<input name="label" required defaultValue={social?.label} placeholder="@handle" style={inputStyle} /></label>
      </div>
      <label style={labelStyle}>URL<input name="url" required type="url" defaultValue={social?.url} placeholder="https://…" style={inputStyle} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Sort order<input name="sortOrder" type="number" defaultValue={social?.sortOrder ?? 0} style={inputStyle} /></label>
        <label style={labelStyle}>Visible
          <select name="isVisible" defaultValue={social ? String(social.isVisible) : 'true'} style={inputStyle}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>
      <button className="button primary" type="submit" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
        {social ? 'Save social link' : 'Add social link'}
      </button>
    </form>
  )
}

const miniBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--line)',
  color: '#aac0d5',
  borderRadius: 5,
  padding: '4px 8px',
  fontSize: 11,
  cursor: 'pointer',
}

const dangerBtn: React.CSSProperties = {
  ...miniBtn,
  color: '#f0a3a3',
  borderColor: 'rgba(240,163,163,.3)',
}
