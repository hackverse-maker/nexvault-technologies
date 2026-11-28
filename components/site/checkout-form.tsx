'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Banknote, CreditCard, Check } from 'lucide-react'

type Props = {
  planSlug: string
  planName: string
  currency: string
  planPrice: number
  comparePrice: number | null
  discountPercent: number | null
  finalAmount: number
  advanceAmount: number
  features: string[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function money(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function CheckoutForm({ planSlug, planName, currency, planPrice, comparePrice, discountPercent, finalAmount, advanceAmount, features }: Props) {
  const router = useRouter()
  const [payment, setPayment] = useState<'cash' | 'online'>('cash')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadedAt] = useState(() => Date.now())

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>

    const next: Record<string, string> = {}
    const name = (data.name ?? '').trim()
    const phone = (data.phone ?? '').trim()
    const email = (data.email ?? '').trim()
    const phoneDigits = phone.replace(/\D/g, '')

    if (name.length < 2) next.name = 'Please enter your full name.'
    if (phoneDigits.length < 7 || phoneDigits.length > 15 || !/^\+?[0-9\s\-()]+$/.test(phone)) {
      next.phone = 'Enter a valid phone number (7–15 digits).'
    }
    if (email && !EMAIL_RE.test(email)) next.email = 'Enter a valid email address or leave it blank.'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    setFormError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planSlug,
          name,
          phone,
          email: email || undefined,
          paymentMethod: payment,
          website: data.website ?? '',
          ts: loadedAt,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body.orderNumber) {
        throw new Error(body.error || 'Something went wrong. Please try again.')
      }
      router.push(`/order-confirmation?order=${encodeURIComponent(body.orderNumber)}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const fieldError = (key: string) =>
    errors[key] ? <p style={{ color: '#f0a3a3', fontSize: 11, margin: '6px 0 0' }}>{errors[key]}</p> : null

  return (
    <form className="checkout-form" onSubmit={submit} noValidate>
      <div className="form-row">
        <label>
          Full name <span style={{ color: '#f0a3a3' }}>*</span>
          <input name="name" placeholder="Your full name" autoComplete="name" required />
          {fieldError('name')}
        </label>
        <label>
          Phone number <span style={{ color: '#f0a3a3' }}>*</span>
          <input name="phone" type="tel" placeholder="+92 300 0000000" autoComplete="tel" required />
          {fieldError('phone')}
        </label>
      </div>
      <label>
        Email address <span style={{ color: '#5f7a99', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        <input name="email" type="email" placeholder="you@company.com" autoComplete="email" />
        {fieldError('email')}
      </label>

      <div style={{ marginTop: 8 }}>
        <p style={{ color: '#aac0d5', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 10px' }}>
          Payment method <span style={{ color: '#f0a3a3' }}>*</span>
        </p>
        <div className="pay-options">
          <button
            type="button"
            className={`pay-option ${payment === 'cash' ? 'active' : ''}`}
            onClick={() => setPayment('cash')}
            aria-pressed={payment === 'cash'}
          >
            <span className="pay-option-icon"><Banknote size={18} /></span>
            <span className="pay-option-text">
              <strong>Cash Payment</strong>
              <small>Pay in cash as per the agreed arrangement.</small>
            </span>
            {payment === 'cash' && <Check size={16} className="pay-option-check" />}
          </button>
          <button
            type="button"
            className={`pay-option ${payment === 'online' ? 'active' : ''}`}
            onClick={() => setPayment('online')}
            aria-pressed={payment === 'online'}
          >
            <span className="pay-option-icon"><CreditCard size={18} /></span>
            <span className="pay-option-text">
              <strong>Online Payment</strong>
              <small>Online payment instructions will be shared after order confirmation.</small>
            </span>
            {payment === 'online' && <Check size={16} className="pay-option-check" />}
          </button>
        </div>
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />

      <div className="advance-notice" style={{ marginTop: 18 }}>
        <strong>50% Advance Payment Required</strong>
        <p>A 50% advance payment of <strong>{money(advanceAmount, currency)}</strong> is required to confirm your order. The remaining 50% balance will be payable upon completion or as agreed.</p>
      </div>

      <button className="button primary checkout-submit" type="submit" disabled={loading}>
        {loading ? 'Placing order…' : <>Confirm order · Pay advance {money(advanceAmount, currency)} <ArrowRight size={16} /></>}
      </button>
      {formError && <p className="form-success" style={{ color: '#f0a3a3' }}>{formError}</p>}
      <p style={{ color: '#6f8297', fontSize: 11, margin: 0 }}>
        By confirming, you agree to be contacted about your order. Only the 50% advance is due now — the balance is payable later as agreed.
      </p>
    </form>
  )
}
