import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactInformation, socialMediaLinks, websiteSettings } from '@/lib/db/schema'
import { PageHeader, Card, Badge, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { saveContactInfoAction, saveSocialLinkAction, saveWebsiteSettingsAction, deleteSocialLinkAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Business Info — NexVault Admin' }

export default async function AdminBusinessPage() {
  const settings = await db.query.websiteSettings.findFirst({ where: (t, { eq }) => eq(t.id, 1) })
  const contact = await db.query.contactInformation.findFirst({ where: (t, { eq }) => eq(t.id, 1) })
  const socials = await db.query.socialMediaLinks.findMany({ orderBy: [asc(socialMediaLinks.sortOrder)] })

  return (
    <>
      <PageHeader title="Business Information" description="Core company identity, contact details, and social profiles shown across the website." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Company profile</h2>
          <form action={saveWebsiteSettingsAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Company name<input name="companyName" defaultValue={settings?.companyName ?? 'NexVault Technologies'} style={inputStyle} /></label>
            <label style={labelStyle}>Tagline<input name="tagline" defaultValue={settings?.tagline ?? ''} placeholder="Build. Rank. Grow." style={inputStyle} /></label>
            <label style={labelStyle}>Default SEO title<input name="defaultSeoTitle" defaultValue={settings?.defaultSeoTitle ?? ''} style={inputStyle} /></label>
            <label style={labelStyle}>Default SEO description<textarea name="defaultSeoDescription" rows={3} defaultValue={settings?.defaultSeoDescription ?? ''} style={{ ...inputStyle, resize: 'vertical' }} /></label>
            <button className="button primary" type="submit" style={{ alignSelf: 'flex-start' }}>Save profile</button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Contact information</h2>
          <form action={saveContactInfoAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={labelStyle}>Primary phone<input name="primaryPhone" defaultValue={contact?.primaryPhone ?? ''} style={inputStyle} /></label>
              <label style={labelStyle}>Secondary phone<input name="secondaryPhone" defaultValue={contact?.secondaryPhone ?? ''} style={inputStyle} /></label>
            </div>
            <label style={labelStyle}>WhatsApp number<input name="whatsappNumber" defaultValue={contact?.whatsappNumber ?? ''} placeholder="923148951060" style={inputStyle} /></label>
            <label style={labelStyle}>Business email<input name="businessEmail" type="email" defaultValue={contact?.businessEmail ?? ''} style={inputStyle} /></label>
            <label style={labelStyle}>Address / service area<input name="address" defaultValue={contact?.address ?? ''} placeholder="Internationally remote" style={inputStyle} /></label>
            <button className="button primary" type="submit" style={{ alignSelf: 'flex-start' }}>Save contact info</button>
          </form>
        </Card>

        <Card style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Social media links</h2>
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
              <thead>
                <tr>{['Platform', 'Label', 'URL', 'Order', 'Visible', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {socials.map((social) => (
                  <tr key={social.id}>
                    <td style={tdStyle}>{social.platform}</td>
                    <td style={tdStyle}>{social.label}</td>
                    <td style={{ ...tdStyle, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{social.url}</td>
                    <td style={tdStyle}>{social.sortOrder}</td>
                    <td style={tdStyle}><Badge tone={social.isVisible ? 'green' : 'slate'}>{social.isVisible ? 'Visible' : 'Hidden'}</Badge></td>
                    <td style={tdStyle}>
                      <details>
                        <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                        <form action={saveSocialLinkAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minWidth: 280 }}>
                          <input type="hidden" name="id" value={social.id} />
                          <input name="platform" defaultValue={social.platform} placeholder="Platform" style={inputStyle} />
                          <input name="label" defaultValue={social.label} placeholder="Label" style={inputStyle} />
                          <input name="url" defaultValue={social.url} placeholder="URL" style={inputStyle} />
                          <input name="sortOrder" type="number" defaultValue={social.sortOrder} placeholder="Sort order" style={inputStyle} />
                          <input type="hidden" name="isVisible" value={String(social.isVisible)} />
                          <button className="button primary" type="submit" style={{ fontSize: 12, padding: '10px 14px' }}>Save</button>
                        </form>
                      </details>
                      <form action={deleteSocialLinkAction} style={{ display: 'inline', marginLeft: 8 }}>
                        <input type="hidden" name="id" value={social.id} />
                        <button type="submit" style={{ background: 'transparent', border: '1px solid rgba(240,163,163,.3)', color: '#f0a3a3', borderRadius: 5, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {socials.length === 0 && (
                  <tr><td style={tdStyle} colSpan={6}>No social links configured.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <form action={saveSocialLinkAction} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'end' }}>
            <label style={labelStyle}>Platform<input name="platform" required placeholder="instagram" style={inputStyle} /></label>
            <label style={labelStyle}>Label<input name="label" required placeholder="@handle" style={inputStyle} /></label>
            <label style={labelStyle}>URL<input name="url" required placeholder="https://…" style={inputStyle} /></label>
            <label style={labelStyle}>Order<input name="sortOrder" type="number" defaultValue={0} style={inputStyle} /></label>
            <input type="hidden" name="isVisible" value="true" />
            <button className="button primary" type="submit">Add link</button>
          </form>
        </Card>
      </div>
    </>
  )
}
