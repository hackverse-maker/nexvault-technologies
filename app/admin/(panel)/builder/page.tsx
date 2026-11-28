import Link from 'next/link'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pages, sections, mediaLibrary } from '@/lib/db/schema'
import { PageHeader, Card, Badge } from '@/components/admin/ui'
import { SectionBuilder } from '@/components/admin/section-builder'
import { PublishBar } from '@/components/admin/publish-bar'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Section Builder — NexVault Admin' }

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const { slug } = await searchParams
  const allPages = await db.query.pages.findMany({ orderBy: [asc(pages.title)] })
  const selected = allPages.find((p) => p.slug === slug) ?? allPages[0]

  if (!selected) {
    return (
      <>
        <PageHeader title="Section Builder" description="Visually build page sections with drag-and-drop ordering." />
        <Card>
          <p style={{ color: '#5f7a99', fontSize: 13 }}>
            No pages yet.{' '}
            <Link href="/admin/pages" style={{ color: 'var(--cyan)' }}>Create a page</Link> first.
          </p>
        </Card>
      </>
    )
  }

  const pageSections = await db.query.sections.findMany({
    where: eq(sections.pageId, selected.id),
    orderBy: [asc(sections.sortOrder)],
  })
  const media = await db.query.mediaLibrary.findMany({
    orderBy: [asc(mediaLibrary.originalName)],
    columns: { id: true, originalName: true },
  })

  return (
    <>
      <PageHeader
        title={`Builder — ${selected.title}`}
        description="Drag to reorder, click edit to configure content, background, layout, and visibility. Changes go live on the frontend for published pages."
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Badge tone={selected.status === 'published' ? 'green' : selected.status === 'draft' ? 'amber' : 'slate'}>{selected.status}</Badge>
          <Link href="/admin/sections" style={{ color: 'var(--cyan)', fontSize: 12 }}>Simple list view</Link>
        </div>
      </PageHeader>

      <div style={{ marginBottom: 20 }}>
        <PublishBar
          pageId={selected.id}
          slug={selected.slug}
          status={selected.status}
          draftSavedAt={selected.draftSavedAt?.toISOString() ?? null}
          publishedAt={selected.publishedAt?.toISOString() ?? null}
          hasSnapshot={selected.publishedSnapshot != null}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {allPages.map((p) => (
          <Link
            key={p.id}
            href={`/admin/builder?slug=${p.slug}`}
            style={{
              padding: '8px 14px',
              borderRadius: 99,
              fontSize: 12,
              border: '1px solid var(--line)',
              background: selected.id === p.id ? 'rgba(0,200,255,.12)' : 'transparent',
              color: selected.id === p.id ? 'var(--cyan)' : '#8aa0b8',
            }}
          >
            {p.title}
          </Link>
        ))}
      </div>

      <SectionBuilder
        pageId={selected.id}
        pageSlug={selected.slug}
        pageStatus={selected.status}
        initialSections={pageSections.map((s) => ({
          id: s.id,
          sectionType: s.sectionType,
          content: (s.content ?? {}) as Record<string, unknown>,
          sortOrder: s.sortOrder,
          isVisible: s.isVisible,
        }))}
        mediaOptions={media.map((m) => ({ id: m.id, label: m.originalName }))}
      />
    </>
  )
}
