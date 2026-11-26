import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { services } from '@/lib/db/schema'
import { PageHeader, Card, Badge, EmptyState, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { saveServiceAction, deleteServiceAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Services — NexVault Admin' }

export default async function AdminServicesPage() {
  const items = await db.query.services.findMany({ orderBy: [asc(services.sortOrder), asc(services.title)] })

  return (
    <>
      <PageHeader title="Services Management" description="The services offered on the website — titles, descriptions, features, and visibility." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Services ({items.length})</h2>
          {items.length === 0 ? (
            <EmptyState text="No services yet." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Service', 'Features', 'Status', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((service) => (
                    <tr key={service.id}>
                      <td style={tdStyle}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{service.title}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#5f7a99' }}>/{service.slug}</p>
                        <details style={{ marginTop: 8 }}>
                          <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                          <ServiceForm service={service} compact />
                        </details>
                      </td>
                      <td style={tdStyle}>{Array.isArray(service.features) ? service.features.length : 0}</td>
                      <td style={tdStyle}><Badge tone={service.isActive ? 'green' : 'slate'}>{service.isActive ? 'Active' : 'Hidden'}</Badge></td>
                      <td style={tdStyle}>
                        <form action={deleteServiceAction}>
                          <input type="hidden" name="id" value={service.id} />
                          <button type="submit" style={dangerBtn}>Delete</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>Add service</h2>
          <ServiceForm />
        </Card>
      </div>
    </>
  )
}

function ServiceForm({
  service,
  compact = false,
}: {
  service?: {
    id: string
    title: string
    slug: string
    description: string
    features: unknown
    sortOrder: number
    isActive: boolean
  }
  compact?: boolean
}) {
  const featuresText = Array.isArray(service?.features) ? (service.features as string[]).join('\n') : ''
  return (
    <form
      action={saveServiceAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: compact ? 10 : 0, minWidth: compact ? 300 : 'auto' }}
    >
      {service && <input type="hidden" name="id" value={service.id} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Title<input name="title" required defaultValue={service?.title} placeholder="Web Development" style={inputStyle} /></label>
        <label style={labelStyle}>Slug<input name="slug" required defaultValue={service?.slug} placeholder="web-development" style={inputStyle} /></label>
      </div>
      <label style={labelStyle}>Description<textarea name="description" rows={2} defaultValue={service?.description} style={{ ...inputStyle, resize: 'vertical' }} /></label>
      <label style={labelStyle}>Features (one per line)<textarea name="features" rows={4} defaultValue={featuresText} placeholder={'Fast delivery\nMobile responsive\nSEO ready'} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Sort order<input name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} style={inputStyle} /></label>
        <label style={labelStyle}>Active
          <select name="isActive" defaultValue={service ? String(service.isActive) : 'true'} style={inputStyle}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>
      <button className="button primary" type="submit" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
        {service ? 'Save service' : 'Add service'}
      </button>
    </form>
  )
}

const dangerBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(240,163,163,.3)',
  color: '#f0a3a3',
  borderRadius: 5,
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
}
