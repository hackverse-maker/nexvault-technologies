import 'server-only'

import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { heroSlides, sliderSlides, sliders } from '@/lib/db/schema'
import { mediaImagePath } from '@/lib/media'

export type PublicSlide = {
  id: string
  image: string | null
  title: string
  subtitle: string
  caption: string
  ctaLabel: string
  ctaHref: string
}

export type PublicSlider = {
  id: string
  slug: string
  name: string
  slides: PublicSlide[]
}

function toPublicSlide(
  slide: { id: string; mediaId: string | null; title: string; ctaLabel: string; ctaHref: string },
  extra: { subtitle?: string; caption?: string } = {},
): PublicSlide {
  return {
    id: slide.id,
    image: slide.mediaId ? mediaImagePath(slide.mediaId) : null,
    title: slide.title,
    subtitle: extra.subtitle ?? '',
    caption: extra.caption ?? '',
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref,
  }
}

/** All visible sliders with their visible slides, keyed by slug. */
export async function getPublicSliders(): Promise<Record<string, PublicSlider>> {
  try {
    return await loadPublicSliders()
  } catch (error) {
    console.error('Failed to load sliders:', error instanceof Error ? error.message : error)
    return {}
  }
}

async function loadPublicSliders(): Promise<Record<string, PublicSlider>> {
  const [allSliders, allSlides] = await Promise.all([
    db.query.sliders.findMany({ where: eq(sliders.isVisible, true) }),
    db.query.sliderSlides.findMany({
      where: eq(sliderSlides.isVisible, true),
      orderBy: [asc(sliderSlides.sortOrder)],
    }),
  ])

  const map: Record<string, PublicSlider> = {}
  for (const slider of allSliders) {
    map[slider.slug] = {
      id: slider.id,
      slug: slider.slug,
      name: slider.name,
      slides: allSlides
        .filter((s) => s.sliderId === slider.id)
        .map((s) => toPublicSlide(s, { caption: s.caption })),
    }
  }
  return map
}

/** Visible hero slides for the homepage backdrop, ordered. */
export async function getPublicHeroSlides(): Promise<PublicSlide[]> {
  try {
    const slides = await db.query.heroSlides.findMany({
      where: eq(heroSlides.isVisible, true),
      orderBy: [asc(heroSlides.sortOrder)],
    })
    return slides.map((s) => toPublicSlide(s, { subtitle: s.subtitle }))
  } catch (error) {
    console.error('Failed to load hero slides:', error instanceof Error ? error.message : error)
    return []
  }
}
