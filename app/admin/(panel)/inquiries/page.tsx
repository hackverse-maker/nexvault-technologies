import { desc, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactInquiries, products, services } from '@/lib/db/schema'
import { PageHeader } from '@/components/admin/ui'
import { InquiryManager, type InquiryItem } from '@/components/admin/inquiry-manager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inquiries — NexVault Admin' }

export default async function AdminInquiriesPage() {
  const rows = await db.query.contactInquiries.findMany({
    orderBy: [desc(contactInquiries.createdAt)],
    limit: 200,
  })

  const serviceIds = [...new Set(rows.map((r) => r.serviceId).filter((id): id is string => Boolean(id)))]
  const productIds = [...new Set(rows.map((r) => r.productId).filter((id): id is string => Boolean(id)))]
  const [serviceRows, productRows] = await Promise.all([
    serviceIds.length ? db.query.services.findMany({ where: inArray(services.id, serviceIds) }) : [],
    productIds.length ? db.query.products.findMany({ where: inArray(products.id, productIds) }) : [],
  ])
  const serviceName = new Map(serviceRows.map((s) => [s.id, s.title]))
  const productName = new Map(productRows.map((p) => [p.id, p.name]))

  const items: InquiryItem[] = rows.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    businessName: r.businessName,
    phone: r.phone,
    subject: r.subject,
    message: r.message,
    requestedPackage: r.requestedPackage,
    serviceName: r.serviceId ? serviceName.get(r.serviceId) ?? null : null,
    productName: r.productId ? productName.get(r.productId) ?? null : null,
    status: r.status,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }))

  return (
    <>
      <PageHeader
        title="Contact Inquiries"
        description="Every website submission is stored here — search, filter, mark read/unread, and follow up. New inquiries are highlighted."
      />
      <InquiryManager items={items} />
    </>
  )
}
