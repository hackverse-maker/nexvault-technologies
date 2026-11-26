import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactInquiries } from '@/lib/db/schema'
import { PageHeader, Card, Badge, EmptyState, inputStyle, labelStyle, thStyle, tdStyle } from '@/components/admin/ui'
import { updateInquiryAction } from '../actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inquiries — NexVault Admin' }

const statusTone = { new: 'cyan', viewed: 'amber', replied: 'green', archived: 'slate' } as const
const STATUSES = ['new', 'viewed', 'replied', 'archived'] as const

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const items = await db.query.contactInquiries.findMany({
    where: status && STATUSES.includes(status as (typeof STATUSES)[number]) ? eq(contactInquiries.status, status) : undefined,
    orderBy: [desc(contactInquiries.createdAt)],
    limit: 100,
  })

  return (
    <>
      <PageHeader title="Contact Inquiries" description="Messages submitted through the website contact and quote forms." />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <FilterChip href="/admin/inquiries" active={!status}>All</FilterChip>
        {STATUSES.map((s) => (
          <FilterChip key={s} href={`/admin/inquiries?status=${s}`} active={status === s}>{s}</FilterChip>
        ))}
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState text="No inquiries found." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['From', 'Service / Package', 'Message', 'Status', 'Received', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{item.fullName}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#8aa0b8' }}>{item.email}</p>
                      {item.businessName && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>{item.businessName}</p>}
                      {item.phone && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5f7a99' }}>{item.phone}</p>}
                    </td>
                    <td style={tdStyle}>
                      <p style={{ margin: 0, fontSize: 12 }}>{item.requestedPackage ?? '—'}</p>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 280 }}>
                      <p style={{ margin: 0, fontSize: 12, color: '#b7c6d6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.message}</p>
                    </td>
                    <td style={tdStyle}><Badge tone={statusTone[item.status as keyof typeof statusTone] ?? 'slate'}>{item.status}</Badge></td>
                    <td style={{ ...tdStyle, fontSize: 11, color: '#5f7a99', whiteSpace: 'nowrap' }}>{item.createdAt.toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <details>
                        <summary style={{ color: 'var(--cyan)', fontSize: 11, cursor: 'pointer' }}>Manage</summary>
                        <form action={updateInquiryAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, minWidth: 240 }}>
                          <input type="hidden" name="id" value={item.id} />
                          <label style={labelStyle}>Status
                            <select name="status" defaultValue={item.status} style={inputStyle}>
                              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>Admin notes<textarea name="adminNotes" rows={2} defaultValue={item.adminNotes ?? ''} style={{ ...inputStyle, resize: 'vertical' }} /></label>
                          <button className="button primary" type="submit" style={{ fontSize: 12, padding: '10px 14px' }}>Update</button>
                        </form>
                      </details>
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

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        padding: '7px 14px',
        borderRadius: 99,
        fontSize: 12,
        border: '1px solid var(--line)',
        background: active ? 'rgba(0,200,255,.12)' : 'transparent',
        color: active ? 'var(--cyan)' : '#8aa0b8',
      }}
    >
      {children}
    </a>
  )
}
