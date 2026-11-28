import Link from 'next/link'
import {
  ArrowRight,
  Check,
  MessageCircle,
  Phone,
  Star,
  Wrench,
  Zap,
  ShieldCheck,
  Mail,
} from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { ContactForm } from '@/components/site/contact-form'
import { HeroBackdrop } from '@/components/site/hero-backdrop'
import { ProcessTimeline } from '@/components/site/process-timeline'
import { contact } from '@/lib/contact'
import { getPublicHeroSlides } from '@/lib/sliders'
import {
  getCatalogProducts,
  getCatalogServices,
  productFeatures,
  productInquiryFallback,
  productPrice,
  serviceIconFor,
  serviceInquiryFallback,
  whatsappInquiryUrl,
} from '@/lib/catalog'
import { getWhatsAppConfig } from '@/lib/whatsapp'
import { getPortfolioProjects } from '@/lib/projects'
import { MediaImg } from '@/components/site/media-image'
import { JsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="section-intro">{text}</p></div>
}

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { title: 'NexVault Technologies | Build. Rank. Grow.', url: '/' },
}

export default async function Home() {
  const [hero, homeServices, packages, maintenance, catalogServices, catalogProducts, waConfig, portfolioProjects] = await Promise.all([
    getPublicHeroSlides(),
    getCatalogServices({ homepageOnly: true }),
    getCatalogProducts({ homepageOnly: true, category: 'website-package' }),
    getCatalogProducts({ category: 'maintenance' }),
    getCatalogServices(),
    getCatalogProducts(),
    getWhatsAppConfig(),
    getPortfolioProjects(),
  ])
  const serviceList = homeServices.slice(0, 6)
  const serviceTitles = catalogServices.map((s) => s.title)
  const packageNames = catalogProducts.map((p) => p.name)
  return (
    <main id="top" className="site-shell">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <SiteHeader />

      <section className="hero">
        <div className="hero-grid" />
        <HeroBackdrop slides={hero} />
        <div className="container hero-content">
          <div className="hero-copy">
            <div className="status-pill"><span /> Currently accepting select projects</div>
            <p className="eyebrow">BUILD <i>•</i> RANK <i>•</i> GROW</p>
            <h1>Digital work that makes your business <em>impossible to ignore.</em></h1>
            <p className="hero-text">We build sharp websites, stronger brands, and digital systems that help ambitious businesses show up clearly and grow with confidence.</p>
            <div className="hero-actions">
              <Link className="button primary" href="/get-a-quote">Let&apos;s work together <ArrowRight size={17} /></Link>
              <Link className="text-link" href="/portfolio">Explore our work <ArrowRight size={16} /></Link>
            </div>
            <div className="hero-proof">
              <div><strong>01</strong><span>Clear direction</span></div>
              <div><strong>02</strong><span>Sharp execution</span></div>
              <div><strong>03</strong><span>Long-term support</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="dashboard-card">
              <div className="dash-top"><span className="dash-dot" /><span>nexvault / overview</span><span className="dash-menu">•••</span></div>
              <div className="dash-body">
                <div className="dash-sidebar"><span className="active" /><span /><span /><span /></div>
                <div className="dash-main">
                  <p>Growth overview</p>
                  <div className="dash-number">+68.4%</div>
                  <div className="chart"><span /><span /><span /><span /><span /><span /><span /></div>
                  <div className="dash-bottom">
                    <div><small>Reach</small><b>24.8k</b></div>
                    <div><small>Leads</small><b>1,284</b></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-chip chip-one"><Zap size={15} /> Fast by design</div>
            <div className="floating-chip chip-two"><ShieldCheck size={15} /> Built to last</div>
          </div>
        </div>
      </section>

      <ProcessTimeline />

      <section id="services" className="section">
        <div className="container">
          <SectionHeading eyebrow="What we do" title="Everything your business needs to move forward." text="No bloated retainers or one-size-fits-all thinking. Just the right mix of strategy, craft, and technology for your next stage." />
          <div className="service-grid">
            {serviceList.map((service) => {
              const Icon = serviceIconFor(service)
              const wa = whatsappInquiryUrl(service.whatsappMessage ?? serviceInquiryFallback(service.title), waConfig.number)
              return (
                <article className="service-card" key={service.id}>
                  <div className="service-icon"><Icon size={23} strokeWidth={2} /></div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 16 }}>
                    <Link href={`/services/${service.slug}`} aria-label={`Learn more about ${service.title}`}>Learn more <ArrowRight size={14} /></Link>
                    {wa && <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp about ${service.title}`}><MessageCircle size={14} /></a>}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="container">
          <div className="split-heading">
            <SectionHeading eyebrow="Selected work" title="Digital presence, with a point of view." text="A few directions we&apos;ve explored for businesses ready to be taken seriously online." />
            <Link href="/portfolio" className="text-link">View all work <ArrowRight size={16} /></Link>
          </div>
          <div className="home-work-grid">
            {portfolioProjects.slice(0, 4).map((project) => (
              <article className="work-card" key={project.slug}>
                <Link href={`/portfolio/${project.slug}`} className="work-media" aria-label={`View ${project.title}`}>
                  {project.image ? (
                    <MediaImg src={project.image} alt={project.title} />
                  ) : (
                    <div className="work-art art-blue" />
                  )}
                </Link>
                <div className="work-meta">
                  <div>
                    <p>{project.category}</p>
                    <h3>{project.title}</h3>
                    {project.description && <p className="work-desc">{project.description}</p>}
                  </div>
                  <Link href={`/portfolio/${project.slug}`} aria-label={`View project ${project.title}`}><ArrowRight size={20} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section pricing-section">
        <div className="container">
          <SectionHeading eyebrow="Website packages" title="A professional start, without the guesswork." text="Choose the level that fits your ambition. Every package is built to get your business online with clarity and confidence." />
          <div className="pricing-grid">
            {packages.map((pkg, i) => {
              const tone = i === 1 ? 'gold popular' : i === 2 ? 'platinum' : 'silver'
              const features = productFeatures(pkg.features)
              const waHref = whatsappInquiryUrl(pkg.whatsappMessage ?? productInquiryFallback(pkg.name), waConfig.number)
              return (
                <article className={`price-card ${tone}`} key={pkg.id}>
                  {pkg.isPopular && <div className="popular-label"><Star size={13} fill="currentColor" /> Most popular</div>}
                  <div className="price-head"><p>{pkg.name}</p><span>{pkg.category || 'Package'}</span></div>
                  {pkg.comparePrice && <div className="price-old">{productPrice({ price: String(pkg.comparePrice), currency: pkg.currency })}</div>}
                  <div className="price-value">{productPrice(pkg)}</div>
                  <ul>
                    {features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}
                    {features.length === 0 && <li style={{ color: 'var(--muted)' }}>Contact us for details</li>}
                  </ul>
                  <Link className="button price-button" href={`/checkout?plan=${encodeURIComponent(pkg.slug)}`}>{pkg.ctaLabel || 'Get started'} <ArrowRight size={16} /></Link>
                  {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', color: '#70e6ac', fontSize: 12, marginTop: 10 }}><MessageCircle size={13} /> Ask on WhatsApp</a>}
                </article>
              )
            })}
          </div>
          {maintenance.length > 0 && (
            <div className="maintenance">
              <div><Wrench size={22} /><strong>Monthly maintenance</strong><span>First month free for all packages</span></div>
              {maintenance.map((m) => <p key={m.id}>{m.name} <b>{productPrice(m)}</b> / mo</p>)}
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Start a conversation</p>
            <h2>Tell us what&apos;s next.</h2>
            <p className="section-intro">Share a little context and we&apos;ll come back with a thoughtful next step. No pressure, no generic pitch.</p>
            <div className="contact-details">
              <a href={`tel:${contact.phoneOne.replaceAll(' ', '')}`}><Phone size={19} strokeWidth={2} /> {contact.phoneOne}</a>
              <a href={`tel:${contact.phoneTwo.replaceAll(' ', '')}`}><Phone size={19} strokeWidth={2} /> {contact.phoneTwo}</a>
              <a href={`mailto:${contact.email}`}><Mail size={19} /> {contact.email}</a>
            </div>
          </div>
          <ContactForm serviceOptions={serviceTitles} packageOptions={packageNames} />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
