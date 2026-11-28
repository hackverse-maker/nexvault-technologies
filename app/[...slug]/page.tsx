import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCmsMetadata, getPublishedPage } from '@/components/site/cms-page'
import { DynamicSections } from '@/components/site/section-renderer'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { PageHero } from '@/components/site/page-hero'
import { breadcrumbJsonLd, JsonLd } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Params = { slug: string[] }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  return getCmsMetadata(slug.join('/'))
}

export default async function DynamicPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const slugPath = slug.join('/')
  const result = await getPublishedPage(slugPath)
  if (!result) notFound()

  const { page, pageSections } = result
  const hasHero = pageSections.some((s) => s.sectionType === 'hero')

  return (
    <main className="site-shell">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: page.title, path: `/${slugPath}` }])} />
      <SiteHeader />
      {!hasHero && (
        <PageHero
          eyebrow="NexVault Technologies"
          title={page.title}
          intro={page.seoDescription ?? undefined}
        />
      )}
      <DynamicSections sections={pageSections} />
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
