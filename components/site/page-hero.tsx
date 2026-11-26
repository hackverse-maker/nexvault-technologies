import type { ReactNode } from 'react'

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  children?: ReactNode
}) {
  return (
    <section className="hero" style={{ minHeight: 'auto', padding: '110px 0 80px' }}>
      <div className="hero-grid" />
      <div className="container hero-content" style={{ gridTemplateColumns: '1fr', gap: 30 }}>
        <div className="hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1 style={{ maxWidth: 780 }}>{title}</h1>
          {intro && <p className="hero-text">{intro}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
