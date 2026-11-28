import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { iconForTitle } from '@/lib/icons'

export function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text?: string
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p className="section-intro">{text}</p>}
    </div>
  )
}

export function ServiceCard({
  icon: Icon,
  title,
  text,
  href,
  features,
}: {
  icon?: LucideIcon
  title: string
  text: string
  href?: string
  features?: string[]
}) {
  const ResolvedIcon = Icon ?? iconForTitle(title)
  const content = (
    <>
      <div className="service-icon"><ResolvedIcon size={23} strokeWidth={2} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {features && features.length > 0 && (
        <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none' }}>
          {features.slice(0, 3).map((feature) => (
            <li key={feature} style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.5, margin: '6px 0', display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--cyan)' }}>•</span> {feature}
            </li>
          ))}
        </ul>
      )}
      {href && (
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--cyan)', fontSize: 12, marginTop: 20 }}>
          Learn more <ArrowRight size={14} />
        </span>
      )}
    </>
  )
  if (href) {
    return (
      <Link href={href} className="service-card" style={{ display: 'block' }}>
        {content}
      </Link>
    )
  }
  return <article className="service-card">{content}</article>
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 8,
        padding: '26px 22px',
        background: 'linear-gradient(145deg, rgba(15,35,63,.75), rgba(5,15,32,.8))',
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 800, color: 'white' }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>{label}</div>
    </div>
  )
}
