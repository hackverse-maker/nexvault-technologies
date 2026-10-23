'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  Globe2,
  LayoutTemplate,
  Mail,
  Menu,
  MessageCircle,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Wrench,
  X,
  Zap,
} from 'lucide-react'

const phoneOne = '+92 334 5013684'
const phoneTwo = '+92 314 8951060'
const email = 'nexvault.technology@gmail.com'
const whatsapp = 'https://wa.me/923148951060'
const instagram = 'https://www.instagram.com/nexvault_tecnologies/'
const facebook = 'https://www.facebook.com/share/1Z2Rwz4ArQ/'

const services = [
  { icon: Code2, title: 'Website Development', text: 'Fast, responsive websites that turn attention into action.' },
  { icon: Palette, title: 'UI/UX Design', text: 'Premium interfaces that make your brand feel credible and clear.' },
  { icon: Search, title: 'SEO & Visibility', text: 'Search-ready foundations that help the right people find you.' },
  { icon: Target, title: 'Digital Marketing', text: 'Focused campaigns and content built around business goals.' },
  { icon: Globe2, title: 'Business Setup', text: 'Domain, hosting, email and Google Business Profile handled.' },
  { icon: Wrench, title: 'Maintenance & Support', text: 'A reliable technical partner long after launch day.' },
]

const packages = [
  { name: 'Silver', label: 'Starter Business Package', old: 'Rs. 15,000', price: 'Rs. 13,500', advance: 'Rs. 4,050', tone: 'silver', features: ['Website with 5 sections', 'Responsive design', 'Domain + hosting for 1 year', 'Business email setup', 'Google Business Profile setup', '3 designed social media posts', 'Facebook + Instagram setup', 'WhatsApp button', 'Delivery: 5–7 working days'] },
  { name: 'Gold', label: 'Professional Business Package', old: 'Rs. 29,990', price: 'Rs. 26,991', advance: 'Rs. 8,097.30', tone: 'gold', popular: true, features: ['Premium landing page up to 8 sections', 'Responsive design + animations', 'Domain + hosting for 1 year', '2 custom-domain email mailboxes', 'Google Business Profile optimization', '6 designed social media posts', 'WhatsApp + contact form', 'Basic SEO + Google Analytics', '15 days bug support', 'Delivery: 7–10 working days'] },
  { name: 'Platinum', label: 'Complete Digital Business Package', old: 'Rs. 45,990', price: 'Rs. 41,391', advance: 'Rs. 12,417.30', tone: 'platinum', features: ['Premium website up to 5 pages', 'Custom UI/UX + animations', 'Domain + hosting for 1 year', '3 custom-domain email mailboxes', 'Google Business Profile optimization', '12 designed social media posts', 'WhatsApp + contact form', 'On-page SEO + Search Console', '30 days bug support', 'Delivery: 12–18 working days'] },
]

function Logo() {
  return <Link href="#top" className="flex items-center gap-3" aria-label="NexVault Technologies home"><div className="logo-mark"><span>N</span></div><div><div className="logo-word">NEX<span>VAULT</span></div><div className="logo-sub">TECHNOLOGIES</div></div></Link>
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="section-intro">{text}</p></div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true) }
  const nav = ['Services', 'Work', 'Pricing', 'Contact']

  return <main id="top" className="site-shell">
    <header className="site-header"><div className="container nav-wrap"><Logo /><nav className={menuOpen ? 'nav-links open' : 'nav-links'}>{nav.map(item => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>)}<a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Start a project <ArrowRight size={15} /></a></nav><button className="menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div></header>

    <section className="hero"><div className="hero-grid" /><div className="container hero-content"><div className="hero-copy"><div className="status-pill"><span /> Currently accepting select projects</div><p className="eyebrow">BUILD <i>•</i> RANK <i>•</i> GROW</p><h1>Digital work that makes your business <em>impossible to ignore.</em></h1><p className="hero-text">We build sharp websites, stronger brands, and digital systems that help ambitious businesses show up clearly and grow with confidence.</p><div className="hero-actions"><a className="button primary" href="#contact">Let&apos;s work together <ArrowRight size={17} /></a><a className="text-link" href="#work">Explore our work <ArrowRight size={16} /></a></div><div className="hero-proof"><div><strong>01</strong><span>Clear direction</span></div><div><strong>02</strong><span>Sharp execution</span></div><div><strong>03</strong><span>Long-term support</span></div></div></div><div className="hero-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="dashboard-card"><div className="dash-top"><span className="dash-dot" /><span>nexvault / overview</span><span className="dash-menu">•••</span></div><div className="dash-body"><div className="dash-sidebar"><span className="active" /><span /><span /><span /></div><div className="dash-main"><p>Growth overview</p><div className="dash-number">+68.4%</div><div className="chart"><span /><span /><span /><span /><span /><span /><span /></div><div className="dash-bottom"><div><small>Reach</small><b>24.8k</b></div><div><small>Leads</small><b>1,284</b></div></div></div></div></div><div className="floating-chip chip-one"><Zap size={15} /> Fast by design</div><div className="floating-chip chip-two"><ShieldCheck size={15} /> Built to last</div></div></div></section>

    <section className="trust-strip"><div className="container trust-inner"><span>Strategy</span><span>Design</span><span>Development</span><span>Visibility</span><span>Growth</span></div></section>

    <section id="services" className="section"><div className="container"><SectionHeading eyebrow="What we do" title="Everything your business needs to move forward." text="No bloated retainers or one-size-fits-all thinking. Just the right mix of strategy, craft, and technology for your next stage." /><div className="service-grid">{services.map(({ icon: Icon, title, text }) => <article className="service-card" key={title}><div className="service-icon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p><a href="#contact" aria-label={`Learn more about ${title}`}>Learn more <ArrowRight size={14} /></a></article>)}</div></div></section>

    <section id="work" className="section work-section"><div className="container"><div className="split-heading"><SectionHeading eyebrow="Selected work" title="Digital presence, with a point of view." text="A few directions we&apos;ve explored for businesses ready to be taken seriously online." /><a href="#contact" className="text-link">Start your project <ArrowRight size={16} /></a></div><div className="work-grid"><article className="work-card work-large"><div className="work-art art-blue"><div className="mock-browser"><div className="browser-bar"><span /><span /><span /></div><div className="browser-content"><div className="mock-line wide" /><div className="mock-line" /><div className="mock-button" /><div className="mock-blocks"><i /><i /><i /></div></div></div></div><div className="work-meta"><div><p>01 / Business website</p><h3>Make a stronger first impression.</h3></div><ArrowRight size={20} /></div></article><article className="work-card"><div className="work-art art-purple"><div className="phone-mock"><div className="phone-notch" /><div className="mock-line wide" /><div className="mock-line" /><div className="mock-button purple" /><i /><i /></div></div><div className="work-meta"><div><p>02 / Digital campaign</p><h3>Turn attention into momentum.</h3></div><ArrowRight size={20} /></div></article></div></div></section>

    <section id="pricing" className="section pricing-section"><div className="container"><SectionHeading eyebrow="Website packages" title="A professional start, without the guesswork." text="Choose the level that fits your ambition. Every package is built to get your business online with clarity and confidence." /><div className="pricing-grid">{packages.map(pkg => <article className={`price-card ${pkg.tone} ${pkg.popular ? 'popular' : ''}`} key={pkg.name}>{pkg.popular && <div className="popular-label"><Star size={13} fill="currentColor" /> Most popular</div>}<div className="price-head"><p>{pkg.name}</p><span>{pkg.label}</span></div><div className="price-old">{pkg.old}</div><div className="price-value">{pkg.price}</div><div className="advance">30% advance: {pkg.advance}</div><ul>{pkg.features.map(feature => <li key={feature}><Check size={15} /> {feature}</li>)}</ul><button className="button price-button" onClick={() => { setSelected(pkg.name); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}>Get started <ArrowRight size={16} /></button></article>)}</div><div className="maintenance"><div><Wrench size={22} /><strong>Monthly maintenance</strong><span>First month free for all packages</span></div><p>Silver <b>Rs. 1,500</b> / mo</p><p>Gold <b>Rs. 2,500</b> / mo</p><p>Platinum <b>Rs. 5,000</b> / mo</p></div></div></section>

    <section id="contact" className="section contact-section"><div className="container contact-grid"><div><p className="eyebrow">Start a conversation</p><h2>Tell us what&apos;s next.</h2><p className="section-intro">Share a little context and we&apos;ll come back with a thoughtful next step. No pressure, no generic pitch.</p><div className="contact-details"><a href={`tel:${phoneOne.replaceAll(' ', '')}`}><MessageCircle size={19} /> {phoneOne}</a><a href={`tel:${phoneTwo.replaceAll(' ', '')}`}><MessageCircle size={19} /> {phoneTwo}</a><a href={`mailto:${email}`}><Mail size={19} /> {email}</a><a href={instagram} target="_blank" rel="noreferrer"><span className="social-text">ig</span> @nexvault_tecnologies</a></div></div><form className="contact-form" onSubmit={submit}><div className="form-row"><label>Full name<input required name="name" placeholder="Your name" /></label><label>Email address<input required type="email" name="email" placeholder="you@company.com" /></label></div><div className="form-row"><label>Business name<input name="business" placeholder="Your business" /></label><label>Required service<select required defaultValue=""><option value="" disabled>Select a service</option>{services.map(s => <option key={s.title}>{s.title}</option>)}</select></label></div><label>Package selection<select value={selected} onChange={e => setSelected(e.target.value)}><option value="">I&apos;m not sure yet</option>{packages.map(p => <option key={p.name}>{p.name} package</option>)}</select></label><label>Project details<textarea required placeholder="Tell us about your goals, timeline, and what you need help with." rows={4} /></label><button className="button primary" type="submit">Send inquiry <ArrowRight size={17} /></button>{submitted && <p className="form-success">Thanks — your note is in. We&apos;ll be in touch shortly.</p>}</form></div></section>

    <footer className="site-footer"><div className="container footer-main"><Logo /><div className="footer-tag">Independent digital strategy, design, and engineering for ambitious businesses.</div><div className="footer-links"><a href="#services">Services</a><a href="#work">Work</a><a href="#pricing">Pricing</a><a href="#contact">Contact</a></div></div><div className="container footer-bottom"><span>© 2026 NexVault Technologies. All Rights Reserved.</span><span>BUILD <i>•</i> RANK <i>•</i> GROW</span><div className="socials"><a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><span className="social-text">ig</span></a><a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><span className="facebook-icon">f</span></a><a href={whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={17} /></a></div></div></footer><a className="whatsapp-float" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><MessageCircle size={24} /></a>
  </main>
}

export default App
