import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageHero } from '@/components/site/page-hero'
import { CtaBand } from '@/components/site/cta-band'
import { ServiceCard } from '@/components/site/section-heading'
import { getCatalogServices, serviceFeatures, serviceIconFor, serviceInquiryFallback, whatsappInquiryUrl } from '@/lib/catalog'
import { getWhatsAppConfig } from '@/lib/whatsapp'
import { breadcrumbJsonLd, JsonLd, pageMetadata, serviceJsonLd } from '@/lib/seo'
import { processSteps } from '@/lib/site-data'

export const dynamic = 'force-dynamic'

const SERVICE_HERO_IMAGES: Record<string, string> = {
  'web-development': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80',
  ecommerce: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
  'google-business-profile': 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1600&q=80',
  'local-seo': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1600&q=80',
  seo: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=80',
  'google-ads': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1600&q=80',
  'social-ads': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
  'social-media': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
  'ui-ux-design': 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1600&q=80',
  branding: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?auto=format&fit=crop&w=1600&q=80',
  maintenance: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const items = await getCatalogServices({ activeOnly: false })
  const service = items.find((s) => s.slug === slug)
  if (!service) return pageMetadata({ title: 'Service not found', path: `/services/${slug}` })
  return pageMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
  })
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [items, waConfig] = await Promise.all([getCatalogServices({ activeOnly: false }), getWhatsAppConfig()])
  const service = items.find((s) => s.slug === slug && s.isActive)
  if (!service) notFound()

  const related = items.filter((s) => s.id !== service.id && s.isActive).slice(0, 3)
  const Icon = serviceIconFor(service)
  const features = serviceFeatures(service.features)
  const wa = whatsappInquiryUrl(service.whatsappMessage ?? serviceInquiryFallback(service.title), waConfig.number)

  return (
    <main className="site-shell">
      <JsonLd data={[serviceJsonLd(service), breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: service.title, path: `/services/${service.slug}` }])]} />
      <SiteHeader />

      <PageHero eyebrow="Service detail" title={service.title} intro={service.description} image={SERVICE_HERO_IMAGES[service.slug]}>
        <div className="service-icon" style={{ width: 52, height: 52, marginBottom: 22 }}>
          <Icon size={24} />
        </div>
        <div className="hero-actions">
          <Link className="button primary" href={`/get-a-quote?service=${encodeURIComponent(service.title)}`}>
            Get a free quote <ArrowRight size={17} />
          </Link>
          {wa && (
            <a className="button" href={wa} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
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
            {features.map((feature) => (
              <article className="service-card" key={feature}>
                <div className="service-icon"><Check size={21} /></div>
                <h3 style={{ fontSize: 16 }}>{feature}</h3>
                <p style={{ marginBottom: 0 }}>Part of our {service.title.toLowerCase()} engagement.</p>
              </article>
            ))}
            {features.length === 0 && (
              <article className="service-card">
                <div className="service-icon"><Check size={21} /></div>
                <h3 style={{ fontSize: 16 }}>Tailored scope</h3>
                <p style={{ marginBottom: 0 }}>We shape the engagement around your goals — talk to us for details.</p>
              </article>
            )}
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
                key={s.id}
                icon={serviceIconFor(s)}
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
