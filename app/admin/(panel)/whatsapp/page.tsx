import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactInformation, whatsappNumbers, whatsappSettings } from '@/lib/db/schema'
import { PageHeader, Card, Badge, EmptyState, inputStyle, labelStyle, tdStyle, thStyle } from '@/components/admin/ui'
import {
  saveWhatsAppSettingsAction,
  saveWhatsAppNumberAction,
  deleteWhatsAppNumberAction,
  toggleWhatsAppNumberAction,
} from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'WhatsApp — NexVault Admin' }

export default async function AdminWhatsAppPage() {
  const [settings, numbers, contactRow] = await Promise.all([
    db.query.whatsappSettings.findFirst({ where: eq(whatsappSettings.id, 1) }),
    db.query.whatsappNumbers.findMany({ orderBy: [asc(whatsappNumbers.sortOrder), asc(whatsappNumbers.label)] }),
    db.query.contactInformation.findFirst({ where: eq(contactInformation.id, 1) }),
  ])

  return (
    <>
      <PageHeader
        title="WhatsApp Integration"
        description="Controls the floating chat widget, default inquiry message, page visibility, and additional WhatsApp numbers shown across the site."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, alignItems: 'start' }}>
        <Card>
          <h2 style={{ fontSize: 15, margin: '0 0 6px' }}>Widget settings</h2>
          <p style={{ color: '#5f7a99', fontSize: 11, margin: '0 0 16px' }}>
            Primary number:{' '}
            <strong style={{ color: '#d7e4f2' }}>+{contactRow?.whatsappNumber ?? '923148951060'}</strong>
            {' '}— edit it under Business Information.
          </p>
          <form action={saveWhatsAppSettingsAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>
              Floating widget
              <select name="widgetEnabled" defaultValue={settings?.widgetEnabled === false ? 'false' : 'true'} style={inputStyle}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>
            <label style={labelStyle}>
              Default message
              <textarea
                name="defaultMessage"
                rows={3}
                defaultValue={settings?.defaultMessage ?? 'Hello! I visited your website and would like to inquire about your services.'}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>
            <label style={labelStyle}>
              Widget visibility
              <select name="visibility" defaultValue={settings?.visibility ?? 'all'} style={inputStyle}>
                <option value="all">Show on all pages</option>
                <option value="exclude">Hide on selected pages</option>
              </select>
            </label>
            <label style={labelStyle}>
              Hidden pages (comma-separated paths, e.g. /admin, /thank-you)
              <input name="hiddenPages" defaultValue={settings?.hiddenPages ?? ''} placeholder="/thank-you, /promo" style={inputStyle} />
            </label>
            <button className="button primary" type="submit" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
              Save WhatsApp settings
            </button>
          </form>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, margin: 0 }}>Additional numbers ({numbers.length})</h2>
          </div>
          {numbers.length === 0 ? (
            <EmptyState text="No additional numbers. Add sales or support lines below." />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Label', 'Number', 'Status', 'Order', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {numbers.map((n) => (
                  <tr key={n.id}>
                    <td style={tdStyle}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{n.label}</p>
                      <details style={{ marginTop: 6 }}>
                        <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Edit</summary>
                        <NumberForm number={n} compact />
                      </details>
                    </td>
                    <td style={tdStyle}>+{n.phone}</td>
                    <td style={tdStyle}><Badge tone={n.isActive ? 'green' : 'slate'}>{n.isActive ? 'Active' : 'Hidden'}</Badge></td>
                    <td style={tdStyle}>{n.sortOrder}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <form action={toggleWhatsAppNumberAction}>
                          <input type="hidden" name="id" value={n.id} />
                          <button type="submit" style={smallBtn}>{n.isActive ? 'Disable' : 'Enable'}</button>
                        </form>
                        <form action={deleteWhatsAppNumberAction}>
                          <input type="hidden" name="id" value={n.id} />
                          <button type="submit" style={{ ...smallBtn, color: '#f0a3a3', borderColor: 'rgba(240,163,163,.3)' }}>Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
            <NumberForm />
          </div>
        </Card>
      </div>
    </>
  )
}

function NumberForm({
  number,
  compact = false,
}: {
  number?: { id: string; label: string; phone: string; sortOrder: number; isActive: boolean }
  compact?: boolean
}) {
  return (
    <form
      action={saveWhatsAppNumberAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: compact ? 10 : 0, minWidth: compact ? 260 : 'auto' }}
    >
      {number && <input type="hidden" name="id" value={number.id} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Label<input name="label" required defaultValue={number?.label} placeholder="Sales line" style={inputStyle} /></label>
        <label style={labelStyle}>Phone (intl format)<input name="phone" required defaultValue={number?.phone} placeholder="923001234567" style={inputStyle} /></label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={labelStyle}>Sort order<input name="sortOrder" type="number" defaultValue={number?.sortOrder ?? 0} style={inputStyle} /></label>
        <label style={labelStyle}>Active
          <select name="isActive" defaultValue={number ? String(number.isActive) : 'true'} style={inputStyle}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>
      <button className="button primary" type="submit" style={{ alignSelf: 'flex-start', fontSize: 12, padding: '10px 16px' }}>
        {number ? 'Save number' : 'Add number'}
      </button>
    </form>
  )
}

const smallBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--line)',
  color: '#aac0d5',
  borderRadius: 5,
  padding: '5px 10px',
  fontSize: 11,
  cursor: 'pointer',
}
