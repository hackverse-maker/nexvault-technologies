import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getWhatsAppConfig, waLink } from '@/lib/whatsapp'
import { formatMoney } from '@/lib/orders'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Order Confirmation',
  description: 'Your NexVault order has been received.',
  path: '/order-confirmation',
})

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash Payment',
  online: 'Online Payment',
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderNumber } = await searchParams
  const [order, waConfig] = await Promise.all([
    orderNumber
      ? db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber.trim()) })
      : null,
    getWhatsAppConfig(),
  ])

  const waMessage = order
    ? `Hello! I just placed order ${order.orderNumber} for the ${order.planName} plan (total ${formatMoney(Number(order.finalAmount), order.currency)}, 50% advance ${formatMoney(Number(order.advanceAmount), order.currency)}) via ${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}. My name is ${order.customerName}.`
    : null
  const waHref = waMessage ? waLink(waConfig.number, waMessage) : null

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section" style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {order ? (
            <div className="service-card" style={{ padding: 'clamp(30px,5vw,52px)', textAlign: 'center' }}>
              <CheckCircle2 size={44} style={{ color: '#47e2a5', marginBottom: 18 }} />
              <p className="eyebrow">Order received</p>
              <h2 style={{ margin: '14px 0 10px' }}>Thank you, {order.customerName.split(' ')[0]}.</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 26px' }}>
                Your order has been saved successfully. Our team will review it and contact you on
                the phone number you provided with the next steps.
              </p>

              <div className="order-summary" style={{ textAlign: 'left', position: 'static', marginBottom: 26 }}>
                <div className="summary-row"><span>Order number</span><strong style={{ color: 'var(--cyan)' }}>{order.orderNumber}</strong></div>
                <div className="summary-row"><span>Plan</span><span>{order.planName}</span></div>
                <div className="summary-row"><span>Total order amount</span><strong>{formatMoney(Number(order.finalAmount), order.currency)}</strong></div>
                <div className="summary-row"><span>50% advance required</span><strong style={{ color: '#70ddff' }}>{formatMoney(Number(order.advanceAmount), order.currency)}</strong></div>
                <div className="summary-row"><span>Remaining balance (50%)</span><span>{formatMoney(Number(order.balanceAmount), order.currency)}</span></div>
                <div className="advance-notice" style={{ marginTop: 10 }}>
                  <strong>50% Advance Payment Required</strong>
                  <p>A 50% advance payment is required to confirm your order. The remaining 50% balance will be payable upon completion or as agreed.</p>
                </div>
                <div className="summary-row"><span>Payment method</span><span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span></div>
                <div className="summary-row"><span>Payment status</span><span style={{ textTransform: 'capitalize' }}>{order.paymentStatus.replaceAll('_', ' ')}</span></div>
                <div className="summary-row"><span>Order status</span><span style={{ textTransform: 'capitalize' }}>{order.orderStatus.replaceAll('_', ' ')}</span></div>
                <div className="summary-row"><span>Placed on</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
              </div>

              <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '20px 22px', background: 'rgba(0,140,255,.05)', textAlign: 'left', marginBottom: 28 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'white' }}>What happens next</p>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 13, lineHeight: 1.8 }}>
                  {order.paymentMethod === 'cash' ? (
                    <>
                      <li>We will contact you to confirm your order and agree on the payment arrangement.</li>
                      <li>Pay the 50% advance of <strong style={{ color: '#70ddff' }}>{formatMoney(Number(order.advanceAmount), order.currency)}</strong> to confirm your order; the remaining 50% balance is payable upon completion or as agreed.</li>
                    </>
                  ) : (
                    <>
                      <li>Your order is registered as pending verification.</li>
                      <li>Online payment instructions will be shared with you after order confirmation — no payment has been charged yet.</li>
                    </>
                  )}
                  <li>Keep your order number <strong style={{ color: 'var(--cyan)' }}>{order.orderNumber}</strong> for reference.</li>
                </ul>
              </div>

              <div className="hero-actions" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                {waHref && (
                  <a className="button" href={waHref} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', borderColor: '#25D366', color: '#fff' }}>
                    <MessageCircle size={16} /> Contact us on WhatsApp
                  </a>
                )}
                <Link className="text-link" href="/">Back to home <ArrowRight size={15} /></Link>
              </div>
            </div>
          ) : (
            <div className="service-card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 44 }}>
              <p className="eyebrow">Order not found</p>
              <h2 style={{ margin: '14px 0 14px' }}>We couldn&apos;t find that order.</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
                The order number is missing or incorrect. If you just placed an order, please contact us and we&apos;ll look into it.
              </p>
              <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link className="button primary" href="/pricing">View plans</Link>
                <Link className="text-link" href="/contact">Contact us</Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
