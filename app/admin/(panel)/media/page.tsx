import { asc, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  heroSlides,
  mediaAssignments,
  mediaLibrary,
  pages,
  products,
  sections,
  services,
  sliderSlides,
  sliders,
} from '@/lib/db/schema'
import { PageHeader } from '@/components/admin/ui'
import { MediaManager, type MediaAsset, type NamedOption, type SliderRecord } from '@/components/admin/media-manager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Media Library — NexVault Admin' }

export default async function AdminMediaPage() {
  const [assets, assignments, hero, allSliders, allSliderSlides, allPages, allProducts, allServices, allSections] =
    await Promise.all([
      db.query.mediaLibrary.findMany({ orderBy: [desc(mediaLibrary.createdAt)] }),
      db.query.mediaAssignments.findMany(),
      db.query.heroSlides.findMany({ orderBy: [asc(heroSlides.sortOrder)] }),
      db.query.sliders.findMany({ orderBy: [asc(sliders.name)] }),
      db.query.sliderSlides.findMany({ orderBy: [asc(sliderSlides.sortOrder)] }),
      db.query.pages.findMany({ orderBy: [asc(pages.title)] }),
      db.query.products.findMany({ orderBy: [asc(products.name)] }),
      db.query.services.findMany({ orderBy: [asc(services.title)] }),
      db.query.sections.findMany({ orderBy: [asc(sections.sortOrder)] }),
    ])

  const pageTitleById = new Map(allPages.map((p) => [p.id, p.title]))
  const sectionLabelById = new Map(
    allSections.map((s) => [s.id, `${pageTitleById.get(s.pageId) ?? 'Page'} — ${s.sectionType}`]),
  )

  const pageOptions: NamedOption[] = allPages.map((p) => ({ id: p.id, label: p.title }))
  const sectionOptions: NamedOption[] = allSections.map((s) => ({ id: s.id, label: sectionLabelById.get(s.id) ?? s.sectionType }))
  const productOptions: NamedOption[] = allProducts.map((p) => ({ id: p.id, label: p.name }))
  const serviceOptions: NamedOption[] = allServices.map((s) => ({ id: s.id, label: s.title }))

  const mediaAssets: MediaAsset[] = assets.map((a) => ({
    id: a.id,
    publicUrl: a.publicUrl,
    objectKey: a.objectKey,
    storageProvider: a.storageProvider,
    originalName: a.originalName,
    mimeType: a.mimeType,
    byteSize: a.byteSize,
    width: a.width,
    height: a.height,
    altText: a.altText,
    caption: a.caption,
    folder: a.folder,
    tags: Array.isArray(a.tags) ? (a.tags as string[]) : [],
    createdAt: a.createdAt.toISOString(),
  }))

  const sliderRecords: SliderRecord[] = allSliders.map((slider) => ({
    id: slider.id,
    name: slider.name,
    slug: slider.slug,
    description: slider.description,
    pageId: slider.pageId,
    isVisible: slider.isVisible,
    slides: allSliderSlides
      .filter((s) => s.sliderId === slider.id)
      .map((s) => ({
        id: s.id,
        mediaId: s.mediaId,
        title: s.title,
        caption: s.caption,
        ctaLabel: s.ctaLabel,
        ctaHref: s.ctaHref,
        sortOrder: s.sortOrder,
        isVisible: s.isVisible,
      })),
  }))

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Upload, organize, and assign images across pages, sections, products, services, hero banners, and sliders."
      />
      <MediaManager
        assets={mediaAssets}
        assignments={assignments.map((a) => ({
          id: a.id,
          mediaId: a.mediaId,
          targetType: a.targetType,
          targetId: a.targetId,
          role: a.role,
        }))}
        heroSlides={hero.map((s) => ({
          id: s.id,
          mediaId: s.mediaId,
          title: s.title,
          subtitle: s.subtitle,
          ctaLabel: s.ctaLabel,
          ctaHref: s.ctaHref,
          sortOrder: s.sortOrder,
          isVisible: s.isVisible,
        }))}
        sliders={sliderRecords}
        pages={pageOptions}
        products={productOptions}
        services={serviceOptions}
        sections={sectionOptions}
        uploadConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      />
    </>
  )
}
