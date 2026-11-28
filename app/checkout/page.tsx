import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CheckoutForm } from '@/components/site/checkout-form'
import { getOrderableProduct, orderAmounts, formatMoney, type OrderAmounts } from '@/lib/orders'
import { productFeatures } from '@/lib/catalog'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Checkout',
  description: 'Complete your NexVault order — review your plan and confirm your details.',
  path: '/checkout',
})

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; package?: string }>
}) {
  const { plan, package: pkg } = await searchParams
  const planKey = plan || pkg || ''
  const product = planKey ? await getOrderableProduct(planKey) : null
  const orderable = product && product.status === 'active' ? product : null
  const amounts: OrderAmounts | null = orderable ? orderAmounts(orderable) : null
  const features = orderable ? productFeatures(orderable.features) : []

  return (
    <main className="site-shell">
      <SiteHeader />
      <section className="section" style={{ paddingTop: 140, paddingBottom: 100 }}>
        <div className="container">
          <Link href="/pricing" className="text-link" style={{ marginBottom: 26, display: 'inline-flex' }}>
            <ArrowLeft size={15} style={{ marginRight: 6 }} /> Back to pricing
          </Link>

          {!orderable || !amounts ? (
            <div className="service-card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 44 }}>
              <p className="eyebrow">Plan not found</p>
              <h2 style={{ margin: '14px 0 14px' }}>We couldn&apos;t find that plan.</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
                The plan you selected is unavailable or the link is incomplete. Choose a plan from the pricing page to continue.
              </p>
              <Link className="button primary" href="/pricing" style={{ marginTop: 24 }}>
                View plans <ArrowLeft size={16} style={{ transform: 'scaleX(-1)' }} />
              </Link>
            </div>
          ) : (
            <>
              <div className="section-heading" style={{ marginBottom: 40 }}>
                <p className="eyebrow">Secure checkout</p>
                <h2>Confirm your order.</h2>
                <p className="section-intro">
                  Review your selected plan below, share your details, and choose how you&apos;d like to pay.
                </p>
              </div>

              <div className="checkout-grid">
                <CheckoutForm
                  planSlug={orderable.slug}
                  planName={orderable.name}
                  currency={amounts.currency}
                  planPrice={amounts.planPrice}
                  comparePrice={amounts.comparePrice}
                  discountPercent={amounts.discountPercent}
                  finalAmount={amounts.finalAmount}
                  advanceAmount={amounts.advanceAmount}
                  features={features}
                />

                <aside className="order-summary">
                  <p className="eyebrow" style={{ marginBottom: 16 }}>Order summary</p>
                  <div className="summary-plan">
                    <div>
                      <h3>{orderable.name}</h3>
                      <p>{orderable.category || 'Website package'}</p>
                    </div>
                    {amounts.discountPercent != null && (
                      <span className="summary-badge">{amounts.discountPercent}% off</span>
                    )}
                  </div>
                  {amounts.comparePrice != null && (
                    <div className="summary-row">
                      <span>Original price</span>
                      <s>{formatMoney(amounts.comparePrice, amounts.currency)}</s>
                    </div>
                  )}
                  {amounts.discountAmount > 0 && (
                    <div className="summary-row discount">
                      <span>Discount</span>
                      <span>-{formatMoney(amounts.discountAmount, amounts.currency)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total order amount</span>
                    <strong>{formatMoney(amounts.finalAmount, amounts.currency)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>50% advance payment required</span>
                    <strong style={{ color: '#70ddff' }}>{formatMoney(amounts.advanceAmount, amounts.currency)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Remaining balance (50%)</span>
                    <span>{formatMoney(amounts.balanceAmount, amounts.currency)}</span>
                  </div>
                  <div className="advance-notice">
                    <strong>50% Advance Payment Required</strong>
                    <p>A 50% advance payment is required to confirm your order. The remaining 50% balance will be payable upon completion or as agreed.</p>
                  </div>
                  {features.length > 0 && (
                    <ul className="summary-features">
                      {features.slice(0, 6).map((f) => <li key={f}>{f}</li>)}
                    </ul>
                  )}
                  <p className="summary-note">
                    Your plan is reserved once the order is confirmed. Payment instructions are shared after confirmation.
                  </p>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
