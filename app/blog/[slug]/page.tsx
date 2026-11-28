import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageHero } from '@/components/site/page-hero'
import { CtaBand } from '@/components/site/cta-band'
import { posts } from '@/lib/site-data'
import { getBlogPost } from '@/lib/blog'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return pageMetadata({ title: 'Article not found', path: `/blog/${slug}` })
  return pageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image || images[post.slug],
  })
}

const images: Record<string, string> = {
  'website-that-works-harder': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
  'local-search-foundations': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1200&auto=format&fit=crop',
  'digital-presence-reset': 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop',
}

type Section = { heading: string; paragraphs: string[] }

const articleSections: Record<string, Section[]> = {
  'website-that-works-harder': [
    {
      heading: 'Start with the job, not the design',
      paragraphs: [
        'Most websites underperform for the same reason: they were designed to look impressive rather than to do a specific job. Before touching layout or color, decide what the site needs to accomplish — capture a lead, sell a product, book a call, or build trust before a first meeting.',
        'Once the job is clear, every section earns its place. A hero that doesn\u2019t tell visitors what you do and why it matters is wasted space. A contact form buried three clicks deep is a conversion killer. Clarity beats cleverness almost every time.',
      ],
    },
    {
      heading: 'Speed and structure are features, not afterthoughts',
      paragraphs: [
        'A beautiful site that takes eight seconds to load will lose visitors before they see it. Performance is part of the product: lean images, sensible caching, minimal third-party scripts, and a hosting setup that doesn\u2019t fall over at the worst moment.',
        'Structure matters just as much. Clear headings, logical page hierarchy, descriptive links, and alt text aren\u2019t just accessibility checkboxes — they help both visitors and search engines understand what matters on each page.',
      ],
    },
    {
      heading: 'Measure what actually matters',
      paragraphs: [
        'Vanity metrics like pageviews tell you almost nothing on their own. Track the actions that connect to revenue: form submissions, calls, purchases, time-to-contact. If you can\u2019t see what\u2019s working, you can\u2019t improve it — and every redesign becomes a guess.',
      ],
    },
  ],
  'local-search-foundations': [
    {
      heading: 'Consistency beats cleverness',
      paragraphs: [
        'Local search rewards boring consistency. Your business name, address, phone number, hours, and categories should be identical everywhere they appear — your website, Google Business Profile, directories, and social profiles. Small inconsistencies quietly erode trust with both customers and search engines.',
      ],
    },
    {
      heading: 'Your profile is a landing page',
      paragraphs: [
        'Treat your Google Business Profile like a storefront, not a formality. Complete every field, choose the most specific categories available, post updates regularly, and keep photos current. An active, complete profile signals a business that is open, attentive, and real.',
      ],
    },
    {
      heading: 'Reviews are a compounding asset',
      paragraphs: [
        'Reviews are one of the few ranking and trust signals you can actively influence. Ask every satisfied customer — at the right moment, through the right channel — and respond to every review, good or bad. A thoughtful reply to a negative review often convinces more people than the review itself.',
      ],
    },
  ],
  'digital-presence-reset': [
    {
      heading: 'Audit before you add',
      paragraphs: [
        'The instinct when growth stalls is to add another channel: a new ad platform, another social network, a second website. Before doing that, audit what you already have. Most businesses have assets that are underperforming because of fixable problems — slow pages, unclear messaging, a profile that contradicts the website.',
      ],
    },
    {
      heading: 'One story, told consistently',
      paragraphs: [
        'Your website, social profiles, ads, and listings should all tell the same story: who you help, what problem you solve, and why you\u2019re the credible choice. When channels contradict each other — different names, different promises, different quality bars — every touchpoint works a little less hard than it could.',
      ],
    },
    {
      heading: 'Fix the foundation, then scale',
      paragraphs: [
        'Paid traffic and aggressive posting amplify whatever is already there — including weaknesses. If your site doesn\u2019t convert visitors into enquiries, more visitors just means more wasted spend. Get the foundation right first, then scale the channels that are working.',
      ],
    },
  ],
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  const related = posts.filter((p) => p.slug !== post.slug)
  const sections = post.sections.length ? post.sections : articleSections[post.slug] ?? []
  const postImage = post.image || images[post.slug] || images['website-that-works-harder']

  return (
    <main className="site-shell">
      <SiteHeader />

      <PageHero eyebrow={post.category} title={post.title} intro={post.excerpt} image={post.image || images[post.slug]}>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          {post.date} · {post.read}
        </p>
        <div className="hero-actions">
          <Link className="text-link" href="/blog">
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> All articles
          </Link>
        </div>
      </PageHero>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', marginBottom: 48 }}>
            <img
              src={postImage}
              alt={post.title}
              loading="lazy"
              style={{ width: '100%', height: 'auto', maxHeight: 460, objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div style={{ display: 'grid', gap: 40 }}>
            {sections.map((section) => (
              <article key={section.heading}>
                <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', marginBottom: 16 }}>{section.heading}</h2>
                {section.paragraphs.map((para, i) => (
                  <p key={i} style={{ color: 'var(--muted)', lineHeight: 1.85, fontSize: 15, margin: i === 0 ? '0 0 14px' : '0 0 14px' }}>
                    {para}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="split-heading">
            <div className="section-heading">
              <p className="eyebrow">Keep reading</p>
              <h2>Related notes.</h2>
            </div>
            <Link className="text-link" href="/blog">All articles <ArrowRight size={16} /></Link>
          </div>
          <div className="work-grid">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="work-card"
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <div className="work-art art-purple" style={{ minHeight: 160 }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'rgba(248,250,252,.85)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="work-meta">
                  <div>
                    <h3>{p.title}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 10 }}>{p.date} · {p.read}</p>
                  </div>
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Put this into practice"
        title="Need help with your digital presence?"
        text="We help businesses turn scattered digital activity into a clear, credible growth system."
      />
      <SiteFooter />
    </main>
  )
}
