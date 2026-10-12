'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  Globe2,
  Layers3,
  Menu,
  MousePointer2,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react'

const services = [
  { icon: Code2, title: 'Web Development', text: 'Fast, scalable websites engineered to turn attention into action.' },
  { icon: Search, title: 'SEO & Local Growth', text: 'Be discovered by the people searching for what you do best.' },
  { icon: MousePointer2, title: 'Paid Advertising', text: 'Focused campaigns built around clarity, testing, and measurable growth.' },
  { icon: Palette, title: 'Brand & UI/UX Design', text: 'Distinctive digital identities that feel as good as they perform.' },
  { icon: Globe2, title: 'Google Business Profile', text: 'A stronger local presence across Search and Maps.' },
  { icon: Layers3, title: 'Social Media Management', text: 'Consistent content and thoughtful strategy for modern brands.' },
]

const projects = [
  { name: 'Northstar Commerce', type: 'E-commerce / Product Design', color: 'from-blue-500/40 via-cyan-400/15 to-slate-950' },
  { name: 'Aurelia Advisory', type: 'Branding / Web Development', color: 'from-violet-500/35 via-blue-500/15 to-slate-950' },
  { name: 'Vertex Local', type: 'Local SEO / Digital Growth', color: 'from-cyan-400/35 via-emerald-400/10 to-slate-950' },
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b1120] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#0b1120]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="#top" className="flex items-center gap-3" aria-label="Nexvault home">
            <span className="flex h-12 w-[164px] items-center overflow-hidden rounded-xl bg-white px-2 shadow-[0_0_28px_rgba(59,130,246,.18)]">
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NexVault%20Technologies%20Orbit%20Logo-EchDBXJkJvnLIOiEbf8qYB76Otnp7A.png" alt="NexVault Technologies" className="h-full w-full object-contain mix-blend-multiply" />
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
            <Link className="transition-colors hover:text-white" href="#top">Home</Link>
            <Link className="transition-colors hover:text-white" href="#about">About</Link>
            <div className="relative">
              <button onClick={() => setServicesOpen(!servicesOpen)} className="flex items-center gap-1 transition-colors hover:text-white" aria-expanded={servicesOpen}>Services <ChevronDown className="size-3.5" /></button>
              {servicesOpen && <div className="absolute left-0 top-8 w-56 rounded-xl border border-white/10 bg-[#111c30] p-2 shadow-2xl"><Link href="#services" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setServicesOpen(false)}>All services</Link><Link href="#process" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setServicesOpen(false)}>Our process</Link></div>}
            </div>
            <Link className="transition-colors hover:text-white" href="#work">Portfolio</Link>
            <Link className="transition-colors hover:text-white" href="#pricing">Pricing</Link>
            <Link className="transition-colors hover:text-white" href="#contact">Contact</Link>
          </nav>
          <div className="hidden lg:block"><Link href="#contact" className="rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold shadow-[0_0_24px_rgba(59,130,246,.28)] transition hover:bg-blue-400">Get a free quote <ArrowRight className="ml-2 inline size-4" /></Link></div>
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="border-t border-white/10 bg-[#0b1120] px-6 py-5 lg:hidden"><div className="flex flex-col gap-5 text-sm text-slate-300"><Link href="#top" onClick={() => setMenuOpen(false)}>Home</Link><Link href="#about" onClick={() => setMenuOpen(false)}>About</Link><Link href="#services" onClick={() => setMenuOpen(false)}>Services</Link><Link href="#work" onClick={() => setMenuOpen(false)}>Portfolio</Link><Link href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link><Link href="#contact" onClick={() => setMenuOpen(false)}>Contact</Link></div></nav>}
      </header>

      <section id="top" className="relative flex min-h-[730px] items-center px-6 pb-20 pt-36 lg:min-h-[820px] lg:px-10 lg:pt-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_40%,rgba(37,99,235,.18),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(6,182,212,.08),transparent_28%)]" />
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(148,163,184,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.12)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-xs font-medium tracking-wide text-blue-200"><Sparkles className="size-3.5" /> Digital experiences built for momentum</div><h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-[78px]">Unlock your <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">digital potential.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">We build websites, grow brands, and drive digital success for ambitious businesses ready to move forward.</p><div className="mt-9 flex flex-wrap gap-4"><Link href="#services" className="rounded-full bg-blue-500 px-6 py-3.5 text-sm font-semibold shadow-[0_0_32px_rgba(59,130,246,.25)] transition hover:-translate-y-0.5 hover:bg-blue-400">Explore our services <ArrowRight className="ml-2 inline size-4" /></Link><Link href="#contact" className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-blue-400/60 hover:bg-white/5">Get a free consultation</Link></div><div className="mt-14 flex items-center gap-8 text-sm text-slate-500"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-cyan-400" /> Built with care</span><span className="flex items-center gap-2"><BarChart3 className="size-4 text-cyan-400" /> Growth-minded</span></div></div>
          <div className="relative mx-auto aspect-square w-full max-w-[510px]"><div className="absolute inset-[10%] rounded-full border border-blue-400/20 bg-blue-500/[0.04] shadow-[0_0_100px_rgba(37,99,235,.18)]" /><div className="absolute inset-[22%] rounded-full border border-cyan-300/20" /><div className="absolute inset-[35%] rotate-45 rounded-[30%] border border-blue-300/30 bg-gradient-to-br from-blue-500/20 to-transparent shadow-[inset_0_0_50px_rgba(59,130,246,.12)]" /><div className="absolute left-1/2 top-1/2 flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-blue-300/50 bg-[#101f3a] text-6xl font-black text-blue-300 shadow-[0_0_55px_rgba(59,130,246,.4)]">N</div><div className="absolute right-[8%] top-[19%] size-3 rounded-full bg-cyan-300 shadow-[0_0_22px_8px_rgba(6,182,212,.38)]" /><div className="absolute bottom-[15%] left-[11%] h-px w-32 rotate-[32deg] bg-gradient-to-r from-transparent via-blue-300 to-transparent" /><div className="absolute bottom-[13%] right-[4%] rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] tracking-widest text-slate-400 backdrop-blur">BUILD · RANK · GROW</div></div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-[#111c30]/55 px-6 py-8 lg:px-10"><div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">{['Custom web solutions','Business growth focus','Modern technologies','Client-centered support'].map((item, i) => <div key={item} className="flex items-center gap-3 text-sm text-slate-300"><span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">0{i + 1}</span>{item}</div>)}</div></section>

      <section id="services" className="px-6 py-28 lg:px-10"><div className="mx-auto max-w-7xl"><div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">What we do</p><h2 className="max-w-2xl text-4xl font-bold tracking-[-.04em] sm:text-5xl">Everything you need to <span className="text-slate-500">move forward.</span></h2></div><p className="max-w-sm text-sm leading-7 text-slate-400">From first idea to long-term growth, our capabilities work together to create digital experiences with purpose.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.map(({ icon: Icon, title, text }, i) => <article key={title} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/35 hover:bg-blue-500/[0.06]"><div className="mb-12 flex items-start justify-between"><div className="flex size-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300"><Icon /></div><span className="text-xs text-slate-600">0{i + 1}</span></div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p><Link href="#contact" className="mt-6 inline-flex items-center text-sm font-medium text-blue-300 opacity-0 transition group-hover:opacity-100">Learn more <ArrowRight className="ml-2 size-4" /></Link></article>)}</div></div></section>

      <section id="about" className="bg-[#111c30]/55 px-6 py-28 lg:px-10"><div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">Why Nexvault</p><h2 className="text-4xl font-bold tracking-[-.04em] sm:text-5xl">Small enough to care.<br /><span className="text-slate-500">Sharp enough to deliver.</span></h2><p className="mt-7 max-w-lg leading-7 text-slate-400">We pair thoughtful strategy with hands-on execution. No layers of account managers, no one-size-fits-all packages — just clear work that helps your business become easier to find, trust, and choose.</p><Link href="#contact" className="mt-8 inline-flex items-center text-sm font-semibold text-blue-300">Let&apos;s work together <ArrowRight className="ml-2 size-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2">{['Custom-built solutions','Performance-first engineering','Transparent communication','Long-term support'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><Check className="mb-8 size-5 text-cyan-400" /><h3 className="font-semibold">{item}</h3><p className="mt-2 text-sm leading-6 text-slate-500">Thoughtful decisions, made around your goals and your customers.</p></div>)}</div></div></section>

      <section id="process" className="px-6 py-28 lg:px-10"><div className="mx-auto max-w-7xl"><div className="mb-14"><p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">Our process</p><h2 className="text-4xl font-bold tracking-[-.04em] sm:text-5xl">A clear path from idea<br /><span className="text-slate-500">to impact.</span></h2></div><div className="grid gap-0 border-l border-blue-400/30 md:grid-cols-6 md:border-l-0 md:border-t">{['Discover','Plan','Design','Develop','Launch','Grow'].map((item, i) => <div key={item} className="relative border-b border-white/10 py-6 pl-7 md:border-b-0 md:pl-0 md:pt-8"><span className="absolute -left-[5px] top-7 size-2 rounded-full bg-blue-400 shadow-[0_0_12px_3px_rgba(59,130,246,.6)] md:-top-[5px] md:left-0" /><span className="text-xs text-slate-600">0{i + 1}</span><h3 className="mt-3 font-semibold">{item}</h3><p className="mt-2 pr-4 text-xs leading-5 text-slate-500">Focused steps, shared clearly.</p></div>)}</div></div></section>

      <section id="work" className="bg-[#111c30]/55 px-6 py-28 lg:px-10"><div className="mx-auto max-w-7xl"><div className="mb-14 flex items-end justify-between"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">Selected work</p><h2 className="text-4xl font-bold tracking-[-.04em] sm:text-5xl">Made to be <span className="text-slate-500">noticed.</span></h2></div><Link href="#contact" className="hidden text-sm text-blue-300 md:block">Start a project <ArrowRight className="ml-2 inline size-4" /></Link></div><div className="grid gap-5 lg:grid-cols-3">{projects.map((project) => <article key={project.name} className="group"><div className={`relative aspect-[1.25] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${project.color}`}><div className="absolute inset-5 rounded-xl border border-white/15 bg-[#0b1120]/30 p-5 backdrop-blur-sm"><div className="flex justify-between text-[10px] tracking-widest text-slate-400"><span>NEXVAULT / DEMO</span><BriefcaseBusiness className="size-3" /></div><div className="absolute bottom-6 left-6 right-6"><div className="h-2 w-2/3 rounded-full bg-white/20" /><div className="mt-3 h-2 w-1/2 rounded-full bg-white/10" /></div></div></div><h3 className="mt-5 text-lg font-semibold">{project.name}</h3><p className="mt-1 text-sm text-slate-500">{project.type}</p></article>)}</div></div></section>

      <section id="pricing" className="px-6 py-28 lg:px-10"><div className="mx-auto max-w-7xl rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-transparent p-8 sm:p-12"><div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">Flexible engagement</p><h2 className="text-4xl font-bold tracking-[-.04em]">The right scope.<br /><span className="text-slate-500">A fair quote.</span></h2><p className="mt-5 max-w-md text-sm leading-7 text-slate-400">Every business is different. Tell us what you&apos;re building and we&apos;ll shape a clear, practical proposal around it.</p><Link href="#contact" className="mt-7 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0b1120] transition hover:bg-blue-100">Request a quote <ArrowRight className="ml-2 size-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2">{['Business websites','E-commerce builds','SEO & local growth','Advertising campaigns','Brand & UI/UX','Maintenance & support'].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-300"><Check className="size-4 text-cyan-400" />{item}</div>)}</div></div></div></section>

      <section id="contact" className="px-6 pb-24 pt-10 lg:px-10"><div className="mx-auto grid max-w-7xl gap-12 rounded-3xl border border-white/10 bg-[#111c30] p-8 sm:p-12 lg:grid-cols-2"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.25em] text-cyan-400">Start a conversation</p><h2 className="text-4xl font-bold tracking-[-.04em] sm:text-5xl">Ready to build<br /><span className="text-slate-500">what&apos;s next?</span></h2><p className="mt-6 max-w-md leading-7 text-slate-400">Share a little about your goals. We&apos;ll get back to you with the right next step.</p><div className="mt-10 flex gap-4 text-xs font-medium uppercase tracking-widest text-slate-500"><a href="#contact" className="transition hover:text-white">Instagram</a><a href="#contact" className="transition hover:text-white">LinkedIn</a></div></div><form className="grid gap-4" onSubmit={(event) => event.preventDefault()}><input aria-label="Name" placeholder="Your name" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /><input aria-label="Email" type="email" placeholder="Work email" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /><input aria-label="Service" placeholder="What can we help with?" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /><textarea aria-label="Project details" placeholder="Tell us about your project" rows={4} className="resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /><button type="submit" className="rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold transition hover:bg-blue-400">Send inquiry <ArrowRight className="ml-2 inline size-4" /></button></form></div></section>

      <footer className="border-t border-white/[0.07] px-6 py-10 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-slate-500 md:flex-row md:items-center"><div><div className="font-semibold tracking-[.2em] text-white">NEXVAULT</div><p className="mt-2">Unlock your digital potential.</p></div><div className="flex flex-wrap gap-5"><Link href="#about" className="hover:text-white">About</Link><Link href="#services" className="hover:text-white">Services</Link><Link href="#work" className="hover:text-white">Portfolio</Link><Link href="#contact" className="hover:text-white">Contact</Link></div><p>© 2026 Nexvault Technologies.</p></div></footer>
    </main>
  )
}
