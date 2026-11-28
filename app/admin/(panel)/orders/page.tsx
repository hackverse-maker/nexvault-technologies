import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { PageHeader } from '@/components/admin/ui'
import { OrderManager, type OrderItem } from '@/components/admin/order-manager'
import { formatMoney } from '@/lib/orders'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Orders — NexVault Admin' }

export default async function AdminOrdersPage() {
  const rows = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    limit: 300,
  })

  const items: OrderItem[] = rows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    customerName: r.customerName,
    phoneNumber: r.phoneNumber,
    email: r.email,
    planName: r.planName,
    planPrice: Number(r.planPrice),
    comparePrice: r.comparePrice != null ? Number(r.comparePrice) : null,
    discountAmount: Number(r.discountAmount),
    currency: r.currency,
    finalAmount: Number(r.finalAmount),
    advanceAmount: Number(r.advanceAmount),
    balanceAmount: Number(r.balanceAmount),
    paymentMethod: r.paymentMethod,
    paymentStatus: r.paymentStatus,
    orderStatus: r.orderStatus,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
    formattedTotal: formatMoney(Number(r.finalAmount), r.currency),
  }))

  return (
    <>
      <PageHeader
        title="Orders"
        description="Checkout orders from the pricing page. Update order and payment status here — payment status should only be changed after verifying actual payment."
      />
      <OrderManager items={items} />
    </>
  )
}
