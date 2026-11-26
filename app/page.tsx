import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Code2,
  Globe2,
  Palette,
  Search,
  Star,
  Target,
  Wrench,
  Zap,
  ShieldCheck,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { ContactForm } from '@/components/site/contact-form'
import { HeroBackdrop } from '@/components/site/hero-backdrop'
import { contact } from '@/lib/contact'
import { packages } from '@/lib/packages'
import { getPublicHeroSlides } from '@/lib/sliders'

const services = [
  { icon: Code2, title: 'Website Development', text: 'Fast, responsive websites that turn attention into action.' },
  { icon: Palette, title: 'UI/UX Design', text: 'Premium interfaces that make your brand feel credible and clear.' },
  { icon: Search, title: 'SEO & Visibility', text: 'Search-ready foundations that help the right people find you.' },
  { icon: Target, title: 'Digital Marketing', text: 'Focused campaigns and content built around business goals.' },
  { icon: Globe2, title: 'Business Setup', text: 'Domain, hosting, email and Google Business Profile handled.' },
  { icon: Wrench, title: 'Maintenance & Support', text: 'A reliable technical partner long after launch day.' },
]

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="section-intro">{text}</p></div>
}

export default async function Home() {
  const hero = await getPublicHeroSlides()
  return (
    <main id="top" className="site-shell">
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

      <section className="trust-strip">
        <div className="container trust-inner">
          <span>Strategy</span><span>Design</span><span>Development</span><span>Visibility</span><span>Growth</span>
        </div>
      </section>

      <section id="services" className="section">
        <div className="container">
          <SectionHeading eyebrow="What we do" title="Everything your business needs to move forward." text="No bloated retainers or one-size-fits-all thinking. Just the right mix of strategy, craft, and technology for your next stage." />
          <div className="service-grid">
            {services.map(({ icon: Icon, title, text }) => (
              <article className="service-card" key={title}>
                <div className="service-icon"><Icon size={21} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link href="/services" aria-label={`Learn more about ${title}`}>Learn more <ArrowRight size={14} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="container">
          <div className="split-heading">
            <SectionHeading eyebrow="Selected work" title="Digital presence, with a point of view." text="A few directions we&apos;ve explored for businesses ready to be taken seriously online." />
            <Link href="/portfolio" className="text-link">View all work <ArrowRight size={16} /></Link>
          </div>
          <div className="work-grid">
            <article className="work-card work-large">
              <div className="work-art art-blue">
                <div className="mock-browser">
                  <div className="browser-bar"><span /><span /><span /></div>
                  <div className="browser-content"><div className="mock-line wide" /><div className="mock-line" /><div className="mock-button" /><div className="mock-blocks"><i /><i /><i /></div></div>
                </div>
              </div>
              <div className="work-meta">
                <div><p>01 / Business website</p><h3>Make a stronger first impression.</h3></div>
                <Link href="/portfolio" aria-label="View project"><ArrowRight size={20} /></Link>
              </div>
            </article>
            <article className="work-card">
              <div className="work-art art-purple">
                <div className="phone-mock"><div className="phone-notch" /><div className="mock-line wide" /><div className="mock-line" /><div className="mock-button purple" /><i /><i /></div>
              </div>
              <div className="work-meta">
                <div><p>02 / Digital campaign</p><h3>Turn attention into momentum.</h3></div>
                <Link href="/portfolio" aria-label="View project"><ArrowRight size={20} /></Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="pricing" className="section pricing-section">
        <div className="container">
          <SectionHeading eyebrow="Website packages" title="A professional start, without the guesswork." text="Choose the level that fits your ambition. Every package is built to get your business online with clarity and confidence." />
          <div className="pricing-grid">
            {packages.map((pkg) => (
              <article className={`price-card ${pkg.tone} ${pkg.popular ? 'popular' : ''}`} key={pkg.name}>
                {pkg.popular && <div className="popular-label"><Star size={13} fill="currentColor" /> Most popular</div>}
                <div className="price-head"><p>{pkg.name}</p><span>{pkg.label}</span></div>
                <div className="price-old">{pkg.old}</div>
                <div className="price-value">{pkg.price}</div>
                <div className="advance">30% advance: {pkg.advance}</div>
                <ul>{pkg.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
                <Link className="button price-button" href={`/get-a-quote?package=${pkg.name}`}>Get started <ArrowRight size={16} /></Link>
              </article>
            ))}
          </div>
          <div className="maintenance">
            <div><Wrench size={22} /><strong>Monthly maintenance</strong><span>First month free for all packages</span></div>
            <p>Silver <b>Rs. 1,500</b> / mo</p>
            <p>Gold <b>Rs. 2,500</b> / mo</p>
            <p>Platinum <b>Rs. 5,000</b> / mo</p>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Start a conversation</p>
            <h2>Tell us what&apos;s next.</h2>
            <p className="section-intro">Share a little context and we&apos;ll come back with a thoughtful next step. No pressure, no generic pitch.</p>
            <div className="contact-details">
              <a href={`tel:${contact.phoneOne.replaceAll(' ', '')}`}><MessageCircle size={19} /> {contact.phoneOne}</a>
              <a href={`tel:${contact.phoneTwo.replaceAll(' ', '')}`}><MessageCircle size={19} /> {contact.phoneTwo}</a>
              <a href={`mailto:${contact.email}`}><Mail size={19} /> {contact.email}</a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
