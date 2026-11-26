import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { ContactForm } from './contact-form'
import { MediaImg } from './media-image'
import { ImageSlider } from './image-slider'
import { getPublicSliders, type PublicSlider } from '@/lib/sliders'
import { SectionHeading, ServiceCard, StatCard } from './section-heading'
import { posts } from '@/lib/site-data'
import { contact } from '@/lib/contact'
import { getSectionTypeDef } from '@/lib/section-schema'

export type RenderableSection = {
  id: string
  sectionType: string
  content: unknown
  sortOrder: number
  isVisible?: boolean
}

type SectionContent = Record<string, unknown>

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}

function list(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((i) => i && typeof i === 'object') as Record<string, unknown>[] : []
}

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((i): i is string => typeof i === 'string')
  if (typeof value === 'string') return value.split('\n').map((l) => l.trim()).filter(Boolean)
  return []
}

const BACKGROUND_STYLES: Record<string, React.CSSProperties> = {
  default: {},
  dark: { background: '#061329', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' },
  glass: { background: 'rgba(7,21,43,.55)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' },
  gradient: { background: 'radial-gradient(circle at 70% 20%, rgba(0,140,255,.14), transparent 55%), #061329' },
}

function backgroundStyle(content: SectionContent): React.CSSProperties {
  return BACKGROUND_STYLES[str(content.background)] ?? BACKGROUND_STYLES.default
}

function isCentered(content: SectionContent): boolean {
  return str(content.layout) === 'center'
}

export async function DynamicSections({ sections, contactPackage }: { sections: RenderableSection[]; contactPackage?: string }) {
  const visible = sections.filter((s) => s.isVisible !== false)
  const needsSliders = visible.some((s) => getSectionTypeDef(s.sectionType).type === 'slider')
  const sliders = needsSliders ? await getPublicSliders() : {}
  return (
    <>
      {visible.map((section) => (
        <div key={section.id} style={backgroundStyle((section.content ?? {}) as SectionContent)}>
          <SectionBlock type={section.sectionType} content={(section.content ?? {}) as SectionContent} sliders={sliders} contactPackage={contactPackage} />
        </div>
      ))}
    </>
  )
}

function Heading({ content, fallbackTitle }: { content: SectionContent; fallbackTitle?: string }) {
  const centered = isCentered(content)
  return (
    <div className="section-heading" style={centered ? { textAlign: 'center', marginInline: 'auto' } : undefined}>
      {str(content.eyebrow) && <p className="eyebrow">{str(content.eyebrow)}</p>}
      <h2>{str(content.title) || fallbackTitle || ''}</h2>
      {str(content.text) && <p className="section-intro" style={centered ? { marginInline: 'auto' } : undefined}>{str(content.text)}</p>}
    </div>
  )
}

function CtaLink({ label, href }: { label?: unknown; href?: unknown }) {
  return (
    <div className="hero-actions" style={{ marginTop: 26 }}>
      <Link className="button primary" href={str(href, '/contact')}>
        {str(label, 'Get in touch')} <ArrowRight size={17} />
      </Link>
    </div>
  )
}

function Image({ src, alt, style }: { src: unknown; alt: string; style?: React.CSSProperties }) {
  if (!str(src)) return null
  return (
    <MediaImg src={str(src)} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 280, display: 'block', ...style }} />
  )
}

function SectionBlock({ type, content, sliders, contactPackage }: { type: string; content: SectionContent; sliders: Record<string, PublicSlider>; contactPackage?: string }) {
  const resolved = getSectionTypeDef(type).type
  const title = str(content.title)
  const eyebrow = str(content.eyebrow)
  const text = str(content.text)
  const centered = isCentered(content)

  switch (resolved) {
    case 'hero': {
      const split = str(content.layout) !== 'center' && str(content.image)
      return (
        <section className="hero">
          <div className="hero-grid" />
          <div className="container hero-content" style={split ? undefined : { gridTemplateColumns: '1fr' }}>
            <div className="hero-copy" style={split ? undefined : { textAlign: 'center', marginInline: 'auto' }}>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h1>{title || 'Welcome'}</h1>
              {text && <p className="hero-text" style={split ? undefined : { marginInline: 'auto' }}>{text}</p>}
              <div style={split ? undefined : { display: 'flex', justifyContent: 'center' }}>
                <CtaLink label={content.ctaLabel} href={content.ctaHref} />
              </div>
            </div>
            {split && (
              <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                <Image src={content.image} alt={title} />
              </div>
            )}
          </div>
        </section>
      )
    }

    case 'about': {
      const items = list(content.items)
      const split = str(content.layout) === 'split' || str(content.image)
      return (
        <section className="section">
          <div className="container" style={{ display: 'grid', gridTemplateColumns: split ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <Heading content={content} fallbackTitle="Our story" />
              {text && <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 15, margin: '0 0 18px' }}>{text}</p>}
              {items.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--muted)', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
                      <Check size={16} style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 2 }} />
                      <span><strong style={{ color: 'var(--white)' }}>{str(item.title)}</strong>{str(item.text) ? ` — ${str(item.text)}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {str(content.image) && (
              <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                <Image src={content.image} alt={title || 'About'} />
              </div>
            )}
          </div>
        </section>
      )
    }

    case 'services':
    case 'features': {
      const items = list(content.items)
      return (
        <section className="section">
          <div className="container">
            <Heading content={content} fallbackTitle={resolved === 'services' ? 'Our services' : 'Built for results'} />
            <div className="service-grid">
              {items.map((item, i) => (
                <ServiceCard
                  key={i}
                  title={str(item.title, `Item ${i + 1}`)}
                  text={str(item.description ?? item.text)}
                  href={str(item.href) || undefined}
                  features={strings(item.features)}
                />
              ))}
              {items.length === 0 && (
                <ServiceCard title="Tell us what you need" text="Share your goals and we will recommend the right approach." href="/contact" />
              )}
            </div>
          </div>
        </section>
      )
    }

    case 'portfolio': {
      const items = list(content.items)
      return (
        <section className="section work-section">
          <div className="container">
            <div className="split-heading">
              <Heading content={content} fallbackTitle="Our work" />
              <Link href="/get-a-quote" className="text-link">Start your project <ArrowRight size={16} /></Link>
            </div>
            <div className="work-grid">
              {items.map((item, i) => (
                <article key={i} className="work-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div className={`work-art ${i % 2 === 0 ? 'art-blue' : 'art-purple'}`} style={{ minHeight: 200, position: 'relative' }}>
                    {str(item.image) && (
                      <MediaImg src={str(item.image)} alt={str(item.title)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div className="work-meta">
                    <div>
                      <p>{str(item.category, 'Project')}</p>
                      <h3>{str(item.title, `Project ${i + 1}`)}</h3>
                      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{str(item.description)}</p>
                    </div>
                  </div>
                </article>
              ))}
              {items.length === 0 && (
                <div className="work-card" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                  No items added yet — add content to this section in the admin panel.
                </div>
              )}
            </div>
          </div>
        </section>
      )
    }

    case 'stats': {
      const items = list(content.items)
      return (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            {title && <Heading content={content} />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
              {items.map((item, i) => (
                <StatCard key={i} value={str(item.value, '—')} label={str(item.label)} />
              ))}
            </div>
          </div>
        </section>
      )
    }

    case 'testimonials': {
      const items = list(content.items)
      return (
        <section className="section">
          <div className="container">
            <Heading content={content} fallbackTitle="What clients say" />
            <div className="service-grid">
              {items.map((item, i) => (
                <figure key={i} className="service-card" style={{ margin: 0 }}>
                  <blockquote style={{ margin: 0, color: '#d7e4f2', fontSize: 14, lineHeight: 1.7 }}>“{str(item.quote)}”</blockquote>
                  <figcaption style={{ marginTop: 16, color: 'var(--cyan)', fontSize: 12, fontWeight: 700 }}>{str(item.author, 'Client')}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )
    }

    case 'team': {
      const items = list(content.items)
      return (
        <section className="section">
          <div className="container">
            <Heading content={content} fallbackTitle="Meet the team" />
            <div className="service-grid">
              {items.map((item, i) => (
                <article key={i} className="service-card">
                  {str(item.image) && (
                    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--line)' }}>
                      <Image src={item.image} alt={str(item.name)} style={{ minHeight: 160 }} />
                    </div>
                  )}
                  <h3>{str(item.name, `Member ${i + 1}`)}</h3>
                  <p style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 700 }}>{str(item.role)}</p>
                  <p style={{ marginTop: 10 }}>{str(item.bio)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )
    }

    case 'pricing': {
      const items = list(content.items)
      return (
        <section className="section pricing-section">
          <div className="container">
            <Heading content={content} fallbackTitle="Plans & pricing" />
            <div className="pricing-grid">
              {items.map((item, i) => {
                const features = strings(item.features)
                const tone = i === 1 ? 'gold popular' : i === 2 ? 'platinum' : 'silver'
                return (
                  <article key={i} className={`price-card ${tone}`}>
                    {i === 1 && <div className="popular-label">Most popular</div>}
                    <div className="price-head"><p>{str(item.name, `Plan ${i + 1}`)}</p><span>{str(item.label)}</span></div>
                    <div className="price-value">{str(item.price, '—')}</div>
                    <ul>
                      {features.map((f) => <li key={f}><Check size={15} /> {f}</li>)}
                      {features.length === 0 && <li style={{ color: 'var(--muted)' }}>Contact us for details</li>}
                    </ul>
                    <Link className="button price-button" href="/get-a-quote">Get started <ArrowRight size={16} /></Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )
    }

    case 'faq': {
      const items = list(content.items)
      return (
        <section className="section">
          <div className="container" style={{ maxWidth: 820 }}>
            <Heading content={content} fallbackTitle="Common questions" />
            <div style={{ display: 'grid', gap: 14 }}>
              {items.map((item, i) => (
                <details key={i} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '18px 22px', background: 'rgba(7,21,43,.6)' }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--white)', fontWeight: 600, fontSize: 15, listStyle: 'none' }}>{str(item.q ?? item.question, `Question ${i + 1}`)}</summary>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7, margin: '12px 0 0', fontSize: 14 }}>{str(item.a ?? item.answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )
    }

    case 'slider': {
      const slug = str(content.sliderSlug)
      const slider = slug ? sliders[slug] : undefined
      return (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <Heading content={content} fallbackTitle={slider?.name ?? 'Featured'} />
            {slider && slider.slides.some((s) => s.image) ? (
              <ImageSlider slides={slider.slides} autoplay={str(content.autoplay, 'yes') !== 'no'} />
            ) : (
              <div className="work-card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                {slug ? `Slider "${slug}" has no visible slides yet.` : 'No slider selected — set the slider slug in the section settings.'}
              </div>
            )}
          </div>
        </section>
      )
    }

    case 'contact':
      return (
        <section className="section contact-section">
          <div className="container contact-grid">
            <div>
              <p className="eyebrow">{eyebrow || 'Start a conversation'}</p>
              <h2>{title || "Tell us what's next."}</h2>
              <p className="section-intro">{text || 'Share a little context and we will come back with a thoughtful next step.'}</p>
              <div className="contact-details" style={{ marginTop: 30 }}>
                <a href={`tel:${contact.phoneOne.replaceAll(' ', '')}`}>{contact.phoneOne}</a>
                <a href={`tel:${contact.phoneTwo.replaceAll(' ', '')}`}>{contact.phoneTwo}</a>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </div>
            <ContactForm defaultPackage={contactPackage ?? (str(content.defaultPackage) || undefined)} />
          </div>
        </section>
      )

    case 'cta':
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
              <p className="eyebrow">{eyebrow || 'Start a conversation'}</p>
              <h2 style={{ margin: '16px auto 18px', maxWidth: 640 }}>{title || 'Ready to take your business to the next level?'}</h2>
              {text && <p className="section-intro" style={{ margin: '0 auto 32px' }}>{text}</p>}
              <div className="hero-actions" style={{ justifyContent: 'center' }}>
                <CtaLink label={content.ctaLabel} href={content.ctaHref} />
              </div>
            </div>
          </div>
        </section>
      )

    case 'blog_grid':
      return (
        <section className="section">
          <div className="container">
            <Heading content={content} fallbackTitle="Notes on digital growth" />
            <div className="work-grid">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="work-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div className="work-art art-purple" style={{ minHeight: 140 }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'rgba(248,250,252,.85)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700 }}>{post.category}</span>
                    </div>
                  </div>
                  <div className="work-meta">
                    <div>
                      <h3>{post.title}</h3>
                      <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>{post.date} · {post.read}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )

    case 'text':
    default: {
      const paragraphs = strings(content.paragraphs)
      const split = str(content.layout) === 'split' && str(content.image)
      return (
        <section className="section">
          <div className="container" style={split ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' } : { maxWidth: 820 }}>
            <div style={centered ? { textAlign: 'center' } : undefined}>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {title && <h2 style={{ margin: '14px 0 18px' }}>{title}</h2>}
              {text && <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 15, margin: '0 0 18px' }}>{text}</p>}
              {paragraphs.map((p, i) => (
                <p key={i} style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 15, margin: '0 0 18px' }}>{p}</p>
              ))}
            </div>
            {split && (
              <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                <Image src={content.image} alt={title || 'Content'} />
              </div>
            )}
          </div>
        </section>
      )
    }
  }
}
