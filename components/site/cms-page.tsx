import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pages, sections } from '@/lib/db/schema'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { DynamicSections } from './section-renderer'
import { PageHero } from './page-hero'

export async function getPublishedPage(slug: string) {
  try {
    const page = await db.query.pages.findFirst({
      where: and(eq(pages.slug, slug), eq(pages.status, 'published')),
    })
    if (!page) return null
    const pageSections = await db.query.sections.findMany({
      where: and(eq(sections.pageId, page.id), eq(sections.isVisible, true)),
      orderBy: [asc(sections.sortOrder)],
    })
    return { page, pageSections }
  } catch (error) {
    console.error(`Failed to load page "${slug}":`, error instanceof Error ? error.message : error)
    return null
  }
}

export async function getCmsMetadata(slug: string): Promise<Metadata> {
  const result = await getPublishedPage(slug)
  if (!result) return { title: 'Page not found — NexVault Technologies' }
  const { page } = result
  return {
    title: page.seoTitle || `${page.title} — NexVault Technologies`,
    description: page.seoDescription || undefined,
  }
}

export async function CmsPage({ slug, contactPackage }: { slug: string; contactPackage?: string }) {
  const result = await getPublishedPage(slug)
  if (!result) notFound()

  const { page, pageSections } = result
  const hasHero = pageSections.some((s) => s.sectionType === 'hero')

  return (
    <main className="site-shell">
      <SiteHeader />
      {!hasHero && (
        <PageHero
          eyebrow="NexVault Technologies"
          title={page.title}
          intro={page.seoDescription ?? undefined}
        />
      )}
      <DynamicSections sections={pageSections} contactPackage={contactPackage} />
      {pageSections.length === 0 && (
        <section className="section">
          <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
            <p className="eyebrow">Coming soon</p>
            <h2 style={{ margin: '14px 0' }}>{page.title}</h2>
            <p className="section-intro" style={{ margin: '0 auto 28px' }}>
              This page is published but has no sections yet. Add sections from the admin panel under Section Management.
            </p>
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  )
}
