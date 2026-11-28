import Link from 'next/link'
import { notFound } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pages, sections } from '@/lib/db/schema'
import { PageHeader, Card } from '@/components/admin/ui'
import { DeviceFrame } from '@/components/admin/device-frame'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { DynamicSections } from '@/components/site/section-renderer'
import { PageHero } from '@/components/site/page-hero'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Preview — NexVault Admin' }

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  if (!slug) notFound()

  const page = await db.query.pages.findFirst({ where: eq(pages.slug, slug) })
  if (!page) notFound()

  const allPages = await db.query.pages.findMany({ orderBy: [asc(pages.title)] })
  const pageSections = await db.query.sections.findMany({
    where: eq(sections.pageId, page.id),
    orderBy: [asc(sections.sortOrder)],
  })

  const hasHero = pageSections.some((s) => s.sectionType === 'hero')

  return (
    <>
      <PageHeader
        title={`Preview — ${page.title}`}
        description={`Draft preview of /${page.slug} (${page.status}). This is exactly what visitors will see once published.`}
      >
        <Link href={`/admin/builder?slug=${page.slug}`} style={{ color: 'var(--cyan)', fontSize: 12 }}>
          ← Back to builder
        </Link>
      </PageHeader>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid var(--line)', padding: '10px 18px', background: 'rgba(0,200,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#70ddff' }}>PREVIEW · /{page.slug} · {page.status.toUpperCase()}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {allPages.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/preview?slug=${p.slug}`}
                  style={{
                    fontSize: 10,
                    padding: '4px 9px',
                    borderRadius: 99,
                    border: '1px solid var(--line)',
                    color: p.id === page.id ? 'var(--cyan)' : '#8aa0b8',
                    background: p.id === page.id ? 'rgba(0,200,255,.1)' : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  {p.title}
                </Link>
              ))}
            </div>
            {page.status !== 'published' && (
              <span style={{ fontSize: 11, color: '#f3ca47' }}>Not public yet — publish to go live.</span>
            )}
          </div>
        </div>
        <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '18px 0' }}>
          <DeviceFrame>
            <main className="site-shell">
              <SiteHeader />
              {!hasHero && <PageHero eyebrow="NexVault Technologies" title={page.title} intro={page.seoDescription ?? undefined} />}
              <DynamicSections
                sections={pageSections.map((s) => ({
                  id: s.id,
                  sectionType: s.sectionType,
                  content: s.content,
                  sortOrder: s.sortOrder,
                  isVisible: s.isVisible,
                }))}
              />
              {pageSections.length === 0 && (
                <section className="section">
                  <div className="container" style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    This page has no sections yet.
                  </div>
                </section>
              )}
              <SiteFooter />
            </main>
          </DeviceFrame>
        </div>
      </Card>
    </>
  )
}
