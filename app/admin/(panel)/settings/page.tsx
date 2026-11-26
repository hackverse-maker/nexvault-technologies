import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { websiteSettings } from '@/lib/db/schema'
import { PageHeader, Card, inputStyle, labelStyle } from '@/components/admin/ui'
import { saveWebsiteSettingsAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Website Settings — NexVault Admin' }

export default async function AdminSettingsPage() {
  const settings = await db.query.websiteSettings.findFirst({ where: eq(websiteSettings.id, 1) })

  return (
    <>
      <PageHeader title="Global Website Settings" description="Site-wide defaults applied when a page does not define its own SEO metadata." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Default SEO</h2>
          <form action={saveWebsiteSettingsAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Company name<input name="companyName" defaultValue={settings?.companyName ?? 'NexVault Technologies'} style={inputStyle} /></label>
            <label style={labelStyle}>Tagline<input name="tagline" defaultValue={settings?.tagline ?? ''} style={inputStyle} /></label>
            <label style={labelStyle}>Default SEO title<input name="defaultSeoTitle" defaultValue={settings?.defaultSeoTitle ?? ''} style={inputStyle} /></label>
            <label style={labelStyle}>Default SEO description<textarea name="defaultSeoDescription" rows={3} defaultValue={settings?.defaultSeoDescription ?? ''} style={{ ...inputStyle, resize: 'vertical' }} /></label>
            <button className="button primary" type="submit" style={{ alignSelf: 'flex-start' }}>Save settings</button>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Environment configuration</h2>
          <p style={{ color: '#5f7a99', fontSize: 12, margin: '0 0 16px' }}>
            These values are configured via environment variables and take effect on the public site.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            {[
              ['NEXT_PUBLIC_SITE_URL', 'Canonical site URL'],
              ['NEXT_PUBLIC_BUSINESS_EMAIL', 'Public contact email'],
              ['NEXT_PUBLIC_BUSINESS_PHONE', 'Public phone number'],
              ['NEXT_PUBLIC_WHATSAPP_NUMBER', 'WhatsApp click-to-chat'],
              ['NEXT_PUBLIC_OFFICE_LOCATION', 'Office / service area'],
              ['DATABASE_URL', 'PostgreSQL connection'],
            ].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid rgba(148,163,184,.08)', paddingBottom: 8 }}>
                <span style={{ color: '#8aa0b8' }}>{label}</span>
                <code style={{ color: 'var(--cyan)', fontSize: 11 }}>{key}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
