import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageHero } from '@/components/site/page-hero'
import { CtaBand } from '@/components/site/cta-band'
import { MediaImg } from '@/components/site/media-image'
import { getProjectBySlug, getProjectNeighbors, getPortfolioProjects } from '@/lib/projects'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const projects = await getPortfolioProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return pageMetadata({ title: 'Project not found', path: `/portfolio/${slug}` })
  return pageMetadata({
    title: project.title,
    description: project.description,
    path: `/portfolio/${project.slug}`,
  })
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
  const [project, { next }] = await Promise.all([getProjectBySlug(slug), getProjectNeighbors(slug)])
  if (!project) notFound()

  return (
    <main className="site-shell">
      <SiteHeader />

      <PageHero eyebrow={project.category} title={project.title} intro={project.description} image={project.image || undefined}>
        <div className="hero-actions">
          <Link className="text-link" href="/portfolio">
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> All projects
          </Link>
          {project.link && (
            <a className="button" href={project.link} target="_blank" rel="noopener noreferrer">
              Visit live site <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 48,
              background: '#071c38',
            }}
          >
            {project.image ? (
              <MediaImg
                src={project.image}
                alt={project.title}
                sizes="(max-width: 1160px) 100vw, 1160px"
                style={{ width: '100%', height: 'auto', maxHeight: 520, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                className={`bg-gradient-to-br ${project.accent}`}
                style={{ minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span style={{ color: 'rgba(248,250,252,.8)', fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {project.title} — concept visual
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
            <div>
              <div className="section-heading" style={{ marginBottom: 20 }}>
                <p className="eyebrow">Overview</p>
                <h2>The idea behind the work.</h2>
              </div>
              {project.demo && (
                <p style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Demonstration project — shown for design purposes.
                </p>
              )}
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
                {(project.tech.length > 0 ? project.tech : ['Tailored scope']).map((tech) => (
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

          {next && (
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
          )}
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
