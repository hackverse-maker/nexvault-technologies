import 'server-only'

import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { pages, sections } from '@/lib/db/schema'
import { projects as fallbackProjects, getProject } from '@/lib/site-data'

export type PortfolioProject = {
  slug: string
  title: string
  category: string
  description: string
  image: string
  tech: string[]
  /** External live-site URL — only set for verified real links. */
  link: string | null
  /** True when the entry is a demonstration concept rather than verified client work. */
  demo: boolean
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function strList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
  return []
}

/** Raw project items stored in the portfolio page's portfolio section. */
export async function getPortfolioSectionItems(): Promise<Record<string, unknown>[]> {
  try {
    const page = await db.query.pages.findFirst({
      where: and(eq(pages.slug, 'portfolio'), eq(pages.status, 'published')),
    })
    if (!page) return []
    const section = await db.query.sections.findFirst({
      where: and(eq(sections.pageId, page.id), eq(sections.sectionType, 'portfolio'), eq(sections.isVisible, true)),
      orderBy: [asc(sections.sortOrder)],
    })
    const items = (section?.content as { items?: unknown } | null)?.items
    return Array.isArray(items) ? items.filter((i): i is Record<string, unknown> => Boolean(i) && typeof i === 'object') : []
  } catch (error) {
    console.error('Failed to load portfolio items:', error instanceof Error ? error.message : error)
    return []
  }
}

export function normalizeProject(item: Record<string, unknown>, index = 0): PortfolioProject {
  const title = str(item.title, `Project ${index + 1}`)
  return {
    slug: str(item.slug) || slugify(title),
    title,
    category: str(item.category, 'Project'),
    description: str(item.description),
    image: str(item.image),
    tech: strList(item.tech ?? item.stack ?? item.features),
    link: str(item.link) || null,
    demo: item.demo !== false,
  }
}

/** All portfolio projects — single source shared by the grid, homepage, and detail pages. */
export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  const items = await getPortfolioSectionItems()
  if (items.length > 0) return items.map(normalizeProject)
  // Fallback: static demo projects so the site still renders if the section is empty.
  return fallbackProjects.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    description: p.description,
    image: '',
    tech: p.stack,
    link: null,
    demo: true,
  }))
}

const ACCENTS = [
  'from-cyan-400/30 via-blue-500/20 to-transparent',
  'from-violet-400/25 via-blue-500/20 to-transparent',
  'from-amber-300/25 via-cyan-400/15 to-transparent',
]

export type ProjectDetail = PortfolioProject & { accent: string }

/** Resolve a single project by slug for /portfolio/[slug] detail pages. */
export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const projects = await getPortfolioProjects()
  const index = projects.findIndex((p) => p.slug === slug)
  if (index >= 0) {
    return { ...projects[index], accent: ACCENTS[index % ACCENTS.length] }
  }
  const staticProject = getProject(slug)
  if (!staticProject) return null
  return {
    slug: staticProject.slug,
    title: staticProject.title,
    category: staticProject.category,
    description: staticProject.description,
    image: '',
    tech: staticProject.stack,
    link: null,
    demo: true,
    accent: staticProject.accent,
  }
}

/** Ordered list used for "next project" navigation on detail pages. */
export async function getProjectNeighbors(slug: string) {
  const projects = await getPortfolioProjects()
  const index = projects.findIndex((p) => p.slug === slug)
  if (index < 0 || projects.length < 2) return { next: null as ProjectDetail | null }
  const nextProject = projects[(index + 1) % projects.length]
  return { next: { ...nextProject, accent: ACCENTS[(index + 1) % ACCENTS.length] } }
}
