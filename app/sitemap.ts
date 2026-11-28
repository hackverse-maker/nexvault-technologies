import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { pages, services } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { posts, projects } from '@/lib/site-data'
import { SITE_URL } from '@/lib/seo'

const STATIC_ROUTES = [
  '',
  '/about',
  '/services',
  '/portfolio',
  '/pricing',
  '/blog',
  '/contact',
  '/get-a-quote',
  '/privacy-policy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))

  try {
    const [cmsPages, serviceRows] = await Promise.all([
      db.query.pages.findMany({
        where: eq(pages.status, 'published'),
        columns: { slug: true, updatedAt: true },
      }),
      db.query.services.findMany({
        where: eq(services.isActive, true),
        columns: { slug: true, updatedAt: true },
      }),
    ])

    for (const page of cmsPages) {
      entries.push({
        url: `${SITE_URL}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    }
    for (const service of serviceRows) {
      entries.push({
        url: `${SITE_URL}/services/${service.slug}`,
        lastModified: service.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch {
    // DB unavailable — sitemap still lists static routes.
  }

  for (const post of posts) {
    entries.push({ url: `${SITE_URL}/blog/${post.slug}`, changeFrequency: 'yearly', priority: 0.5 })
  }
  for (const project of projects) {
    entries.push({ url: `${SITE_URL}/portfolio/${project.slug}`, changeFrequency: 'yearly', priority: 0.5 })
  }

  return entries
}
