import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageHero } from '@/components/site/page-hero'
import { CtaBand } from '@/components/site/cta-band'
import { ServiceCard } from '@/components/site/section-heading'
import { services, getService, processSteps } from '@/lib/site-data'

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) return { title: 'Service — NexVault Technologies' }
  return {
    title: `${service.title} — NexVault Technologies`,
    description: service.description,
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3)
  const Icon = service.icon

  return (
    <main className="site-shell">
      <SiteHeader />

      <PageHero eyebrow="Service detail" title={service.title} intro={service.description}>
        <div className="service-icon" style={{ width: 52, height: 52, marginBottom: 22 }}>
          <Icon size={24} />
        </div>
        <div className="hero-actions">
          <Link className="button primary" href="/get-a-quote">
            Get a free quote <ArrowRight size={17} />
          </Link>
          <Link className="text-link" href="/services">
            All services <ArrowRight size={16} />
          </Link>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-heading" style={{ marginBottom: 36 }}>
            <p className="eyebrow">Capabilities</p>
            <h2>What this service covers.</h2>
          </div>
          <div className="service-grid">
            {service.features.map((feature) => (
              <article className="service-card" key={feature}>
                <div className="service-icon"><Check size={21} /></div>
                <h3 style={{ fontSize: 16 }}>{feature}</h3>
                <p style={{ marginBottom: 0 }}>Part of our {service.title.toLowerCase()} engagement.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start' }}>
          <div>
            <div className="section-heading" style={{ marginBottom: 24 }}>
              <p className="eyebrow">Included</p>
              <h2>What&apos;s included.</h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'A clear scope agreed in writing before work begins',
                'Responsive, accessible execution across devices',
                'Regular updates so you always know where things stand',
                'Launch support and a proper handoff when we finish',
                'Ongoing partnership options after delivery',
              ].map((item) => (
                <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--muted)', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 14, lineHeight: 1.6 }}>
                  <Check size={16} style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 3 }} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="section-heading" style={{ marginBottom: 24 }}>
              <p className="eyebrow">Process</p>
              <h2>How an engagement runs.</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {processSteps.map((step, i) => (
                <div
                  key={step}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 999,
                    padding: '10px 18px',
                    background: 'rgba(0,140,255,.06)',
                    color: 'var(--white)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: 'var(--cyan)', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</span>
                  {step}
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, marginTop: 22 }}>
              Every project starts with a focused conversation about your goals, audience, and
              current challenges. From there we recommend the clearest scope — sometimes that
              means starting smaller than you expected.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="split-heading">
            <div className="section-heading">
              <p className="eyebrow">Related services</p>
              <h2>Often paired with this.</h2>
            </div>
            <Link className="text-link" href="/services">All services <ArrowRight size={16} /></Link>
          </div>
          <div className="service-grid">
            {related.map((s) => (
              <ServiceCard
                key={s.slug}
                icon={s.icon}
                title={s.title}
                text={s.description}
                href={`/services/${s.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Ready when you are"
        title={`Let's talk about ${service.title.toLowerCase()}.`}
        text="Share a little context and we'll come back with a thoughtful next step — no pressure, no generic pitch."
      />
      <SiteFooter />
    </main>
  )
}
