import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CtaBand({
  eyebrow = 'Start a conversation',
  title = 'Ready to take your business to the next level?',
  text = 'Tell us what you are building, improving, or figuring out. We will come back with a thoughtful next step.',
  primaryHref = '/get-a-quote',
  primaryLabel = 'Get a free quote',
  secondaryHref = '/contact',
  secondaryLabel = 'Contact us',
}: {
  eyebrow?: string
  title?: string
  text?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 'clamp(36px, 6vw, 72px)',
            background: 'radial-gradient(circle at 80% 20%, rgba(0,140,255,.14), transparent 55%), #061329',
            textAlign: 'center',
          }}
        >
          <p className="eyebrow">{eyebrow}</p>
          <h2 style={{ margin: '16px auto 18px', maxWidth: 640 }}>{title}</h2>
          <p className="section-intro" style={{ margin: '0 auto 32px' }}>
            {text}
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link className="button primary" href={primaryHref}>
              {primaryLabel} <ArrowRight size={17} />
            </Link>
            <Link className="text-link" href={secondaryHref}>
              {secondaryLabel} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
