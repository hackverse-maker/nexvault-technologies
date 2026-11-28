import type { ReactNode } from 'react'
import { MediaImg } from './media-image'

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  /** Optional background photo — darkened so copy stays readable. */
  image?: string
  children?: ReactNode
}) {
  return (
    <section className="hero hero-media" style={{ minHeight: 'auto', padding: '110px 0 80px' }}>
      {image && (
        <>
          <MediaImg
            src={image}
            alt=""
            aria-hidden="true"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              background:
                'linear-gradient(180deg, rgba(4,13,29,.82) 0%, rgba(4,13,29,.72) 55%, rgba(4,13,29,.9) 100%), radial-gradient(circle at 75% 20%, rgba(0,140,255,.14), transparent 55%)',
            }}
          />
        </>
      )}
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
