import 'server-only'

import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { posts as fallbackPosts, getPost as getFallbackPost } from '@/lib/site-data'

export type BlogSection = { heading: string; paragraphs: string[] }

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  read: string
  image: string
  tags: string[]
  sections: BlogSection[]
  seoTitle: string | null
  seoDescription: string | null
}

function toPost(row: typeof blogPosts.$inferSelect): BlogPost {
  const content = Array.isArray(row.content) ? (row.content as BlogSection[]) : []
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category || 'Journal',
    date: row.publishedAt
      ? row.publishedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '',
    read: row.readTime || '',
    image: row.image || '',
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    sections: content.filter((s) => s && typeof s.heading === 'string'),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  }
}

function fallbackToPost(p: (typeof fallbackPosts)[number]): BlogPost {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    read: p.read,
    image: '',
    tags: [],
    sections: [],
    seoTitle: null,
    seoDescription: null,
  }
}

/** Published posts from the database; falls back to bundled content if empty. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const rows = await db.query.blogPosts.findMany({
      where: eq(blogPosts.status, 'published'),
      orderBy: [desc(blogPosts.publishedAt)],
    })
    if (rows.length === 0) return fallbackPosts.map(fallbackToPost)
    return rows.map(toPost)
  } catch {
    return fallbackPosts.map(fallbackToPost)
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const row = await db.query.blogPosts.findFirst({
      where: (b, { and, eq }) => and(eq(b.slug, slug), eq(b.status, 'published')),
    })
    if (row) return toPost(row)
  } catch {
    // fall through to bundled content
  }
  const fallback = getFallbackPost(slug)
  return fallback ? fallbackToPost(fallback) : null
}
