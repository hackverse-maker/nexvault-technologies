import Link from 'next/link'
import { count, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { activityLogs, adminUsers, contactInquiries, mediaLibrary, pages, products, sections, services, user } from '@/lib/db/schema'
import { PageHeader, Card, Badge } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — NexVault Admin' }

export default async function AdminDashboard() {
  const [pageCount, sectionCount, serviceCount, productCount, mediaCount, newInquiries] = await Promise.all([
    db.select({ value: count() }).from(pages),
    db.select({ value: count() }).from(sections),
    db.select({ value: count() }).from(services),
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(mediaLibrary),
    db.select({ value: count() }).from(contactInquiries).where(eq(contactInquiries.status, 'new')),
  ])

  const stats = [
    { label: 'Website pages', value: pageCount[0]?.value ?? 0, href: '/admin/pages' },
    { label: 'Sections', value: sectionCount[0]?.value ?? 0, href: '/admin/sections' },
    { label: 'Services', value: serviceCount[0]?.value ?? 0, href: '/admin/services' },
    { label: 'Products', value: productCount[0]?.value ?? 0, href: '/admin/products' },
    { label: 'Media assets', value: mediaCount[0]?.value ?? 0, href: '/admin/media' },
    { label: 'New inquiries', value: newInquiries[0]?.value ?? 0, href: '/admin/inquiries', highlight: true },
  ]

  const activity = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      createdAt: activityLogs.createdAt,
      adminName: user.name,
    })
    .from(activityLogs)
    .leftJoin(adminUsers, eq(activityLogs.adminUserId, adminUsers.id))
    .leftJoin(user, eq(adminUsers.userId, user.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(8)

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your website content, products, services, and recent admin activity." />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 26,
        }}
      >
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card style={{ padding: '20px', height: '100%' }}>
              <p style={{ color: '#5f7a99', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  margin: 0,
                  color: stat.highlight && Number(stat.value) > 0 ? '#70e6ac' : 'white',
                }}
              >
                {stat.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <Card>
          <h2 style={{ fontSize: 16, margin: '0 0 16px' }}>Recent activity</h2>
          {activity.length === 0 ? (
            <p style={{ color: '#5f7a99', fontSize: 13 }}>No activity recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {activity.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(148,163,184,.08)',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#d7e4f2' }}>
                      <Badge tone={item.action === 'delete' ? 'red' : item.action === 'create' ? 'green' : 'cyan'}>{item.action}</Badge>{' '}
                      {item.entityType.replace(/_/g, ' ')}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#5f7a99' }}>
                      {item.adminName ?? 'System'} · {item.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 16, margin: '0 0 16px' }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { href: '/admin/pages', label: 'Manage pages & SEO' },
              { href: '/admin/inquiries', label: 'Review contact inquiries' },
              { href: '/admin/products', label: 'Add or edit products' },
              { href: '/admin/services', label: 'Update services' },
              { href: '/admin/business', label: 'Update business info' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  color: '#d7e4f2',
                  fontSize: 13,
                }}
              >
                {link.label} <span style={{ color: 'var(--cyan)' }}>→</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
