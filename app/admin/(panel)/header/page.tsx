import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { headerSettings, mediaLibrary, navigationItems, pages } from '@/lib/db/schema'
import { PageHeader, Card, Badge, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { saveHeaderSettingsAction, saveNavItemAction, deleteNavItemAction, moveNavItemAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Header — NexVault Admin' }

export default async function AdminHeaderPage() {
  const [settings, items, allPages, media] = await Promise.all([
    db.query.headerSettings.findFirst({ where: eq(headerSettings.id, 1) }),
    db.query.navigationItems.findMany({
      where: eq(navigationItems.location, 'header'),
      orderBy: [asc(navigationItems.sortOrder)],
    }),
    db.query.pages.findMany({ orderBy: [asc(pages.title)] }),
    db.query.mediaLibrary.findMany({ orderBy: [asc(mediaLibrary.createdAt)] }),
  ])

  const targetLabel = (item: (typeof items)[number]) => {
    if (item.targetUrl) return item.targetUrl
    const page = allPages.find((p) => p.id === item.targetPageId)
    return page ? `/${page.slug}` : '—'
  }

  return (
    <>
      <PageHeader title="Header Management" description="Logo, CTA button, WhatsApp button, and main navigation — changes go live on every page immediately." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, marginBottom: 22 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Header settings</h2>
          <form action={saveHeaderSettingsAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Logo
              <select name="logoMediaId" defaultValue={settings?.logoMediaId ?? ''} style={inputStyle}>
                <option value="">Default NexVault logo</option>
                {media.map((m) => (
                  <option key={m.id} value={m.id}>{m.originalName}</option>
                ))}
              </select>
            </label>
            {media.length === 0 && (
              <p style={{ color: '#5f7a99', fontSize: 11, margin: 0 }}>
                No media assets yet — register an image URL in <a href="/admin/media" style={{ color: 'var(--cyan)' }}>Media Library</a> first.
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={labelStyle}>CTA button label<input name="ctaLabel" defaultValue={settings?.ctaLabel ?? 'Get a free quote'} style={inputStyle} /></label>
              <label style={labelStyle}>CTA button URL<input name="ctaHref" defaultValue={settings?.ctaHref ?? '/get-a-quote'} placeholder="/get-a-quote" style={inputStyle} /></label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'end' }}>
              <label style={labelStyle}>WhatsApp number<input name="whatsappNumber" defaultValue={settings?.whatsappNumber ?? ''} placeholder="923148951060" style={inputStyle} /></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aac0d5', fontSize: 12, paddingBottom: 10 }}>
                <input type="checkbox" name="whatsappEnabled" value="true" defaultChecked={settings?.whatsappEnabled ?? true} />
                Show WhatsApp button
              </label>
            </div>
            <button className="button primary" type="submit" style={{ alignSelf: 'flex-start' }}>Save header settings</button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Navigation items ({items.length})</h2>
          {items.length === 0 ? (
            <p style={{ color: '#5f7a99', fontSize: 13 }}>No header items — the site falls back to default navigation.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['#', 'Label', 'Target', 'Visible', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <form action={moveNavItemAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="location" value="header" />
                          <input type="hidden" name="dir" value="up" />
                          <button type="submit" disabled={index === 0} style={{ ...miniBtn, padding: '2px 8px' }}>↑</button>
                        </form>
                        <form action={moveNavItemAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="location" value="header" />
                          <input type="hidden" name="dir" value="down" />
                          <button type="submit" disabled={index === items.length - 1} style={{ ...miniBtn, padding: '2px 8px' }}>↓</button>
                        </form>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {item.label}
                      <details style={{ marginTop: 8 }}>
                        <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                        <NavItemForm item={item} allPages={allPages} location="header" compact />
                      </details>
                    </td>
                    <td style={tdStyle}><code style={{ fontSize: 11, color: '#70ddff' }}>{targetLabel(item)}</code></td>
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
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Add navigation item</h2>
          <NavItemForm allPages={allPages} location="header" />
        </Card>
      </div>
    </>
  )
}

function NavItemForm({
  item,
  allPages,
  location,
  compact = false,
}: {
  item?: { id: string; label: string; sortOrder: number; isVisible: boolean; targetUrl: string | null; targetPageId: string | null }
  allPages: { id: string; title: string; slug: string }[]
  location: 'header' | 'footer'
  compact?: boolean
}) {
  return (
    <form
      action={saveNavItemAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: compact ? 10 : 0, minWidth: compact ? 280 : 'auto' }}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="location" value={location} />
      <label style={labelStyle}>Label<input name="label" required defaultValue={item?.label} placeholder="Services" style={inputStyle} /></label>
      <label style={labelStyle}>Link to page
        <select name="targetPageId" defaultValue={item?.targetPageId ?? ''} style={inputStyle}>
          <option value="">— custom URL instead —</option>
          {allPages.map((p) => <option key={p.id} value={p.id}>/{p.slug} — {p.title}</option>)}
        </select>
      </label>
      <label style={labelStyle}>…or custom URL<input name="targetUrl" defaultValue={item?.targetUrl ?? ''} placeholder="/pricing or https://…" style={inputStyle} /></label>
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
        {item ? 'Save' : 'Add item'}
      </button>
      <p style={{ color: '#5f7a99', fontSize: 10, margin: 0 }}>Note: provide either a page or a URL, not both.</p>
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
