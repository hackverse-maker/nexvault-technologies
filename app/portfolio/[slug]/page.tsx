import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageHero } from '@/components/site/page-hero'
import { CtaBand } from '@/components/site/cta-band'
import { projects, getProject } from '@/lib/site-data'

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return { title: 'Project — NexVault Technologies' }
  return {
    title: `${project.title} — NexVault Technologies`,
    description: project.description,
  }
}

const deliverables = [
  'Strategy and positioning aligned to business goals',
  'Responsive, accessible design across devices',
  'Performance- and SEO-conscious build',
  'Launch support and structured handoff',
  'Ongoing support options after delivery',
]

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]

  return (
    <main className="site-shell">
      <SiteHeader />

      <PageHero eyebrow={project.category} title={project.title} intro={project.description}>
        <div className="hero-actions">
          <Link className="text-link" href="/portfolio">
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> All projects
          </Link>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            className={`bg-gradient-to-br ${project.accent}`}
            style={{
              border: '1px solid var(--line)',
              borderRadius: 12,
              minHeight: 340,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 48,
            }}
          >
            <span style={{ color: 'rgba(248,250,252,.8)', fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700 }}>
              {project.title} — concept visual
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
            <div>
              <div className="section-heading" style={{ marginBottom: 20 }}>
                <p className="eyebrow">Overview</p>
                <h2>The idea behind the work.</h2>
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 15 }}>
                {project.description} Every NexVault engagement starts with a question: what does
                this business need its digital presence to accomplish? For {project.title}, the
                answer shaped everything from information architecture to the small details that
                make a first impression feel considered.
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 15, marginTop: 16 }}>
                Rather than chasing trends, we focused on clarity, credibility, and the next
                action a visitor should take — because a beautiful site that doesn&apos;t move
                the business forward is just decoration.
              </p>
            </div>
            <div>
              <div className="section-heading" style={{ marginBottom: 20 }}>
                <p className="eyebrow">Stack</p>
                <h2>Tools and disciplines.</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 999,
                      padding: '8px 18px',
                      fontSize: 13,
                      color: 'var(--muted)',
                      background: 'rgba(0,140,255,.06)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="section-heading" style={{ marginBottom: 16 }}>
                <p className="eyebrow">Deliverables</p>
                <h2>What a project like this includes.</h2>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {deliverables.map((d) => (
                  <li key={d} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--muted)', padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
                    <Check size={15} style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 3 }} /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 56, border: '1px solid var(--line)', borderRadius: 12, padding: '28px 30px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
            <div>
              <p className="eyebrow">Next project</p>
              <h3 style={{ margin: '8px 0 0' }}>{next.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: '6px 0 0' }}>{next.category}</p>
            </div>
            <Link className="button primary" href={`/portfolio/${next.slug}`}>
              View project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Inspired?"
        title="Let's build yours."
        text="Tell us about your business and what you want your digital presence to do. We'll come back with a clear next step."
      />
      <SiteFooter />
    </main>
  )
}
