'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { services } from '@/lib/site-data'

const packages = ['Silver package', 'Gold package', 'Platinum package']

export function ContactForm({
  defaultPackage,
  compact = false,
}: {
  defaultPackage?: string
  compact?: boolean
}) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(defaultPackage ?? '')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Request failed')
      setSubmitted(true)
      form.reset()
      setSelected('')
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          border: '1px solid rgba(0,200,255,.3)',
          background: 'rgba(0,200,255,.06)',
          borderRadius: 7,
          padding: '34px 28px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#70e6ac', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Message sent</p>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
          Thanks — your note is in. We&apos;ll be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Full name
          <input required name="name" placeholder="Your name" autoComplete="name" />
        </label>
        <label>
          Email address
          <input required type="email" name="email" placeholder="you@company.com" autoComplete="email" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Business name
          <input name="business" placeholder="Your business" autoComplete="organization" />
        </label>
        <label>
          Phone / WhatsApp
          <input name="phone" placeholder="+92 ..." autoComplete="tel" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Required service
          <select required name="service" defaultValue="">
            <option value="" disabled>
              Select a service
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Package selection
          <select name="package" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">I&apos;m not sure yet</option>
            {packages.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Project details
        <textarea
          required
          name="message"
          placeholder="Tell us about your goals, timeline, and what you need help with."
          rows={compact ? 4 : 5}
        />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
      <button className="button primary" type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send inquiry'} <ArrowRight size={17} />
      </button>
      {error && <p className="form-success" style={{ color: '#f0a3a3' }}>{error}</p>}
      <p style={{ color: '#6f8297', fontSize: 11, margin: 0 }}>
        By submitting, you agree to be contacted about your inquiry.
      </p>
    </form>
  )
}
