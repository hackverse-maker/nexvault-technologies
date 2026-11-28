import { desc, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogPosts, mediaLibrary } from '@/lib/db/schema'
import { PageHeader } from '@/components/admin/ui'
import { BlogManager, type BlogPostItem } from '@/components/admin/blog-manager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Blog — NexVault Admin' }

export default async function AdminBlogPage() {
  const [rows, media] = await Promise.all([
    db.query.blogPosts.findMany({ orderBy: [desc(blogPosts.updatedAt)] }),
    db.query.mediaLibrary.findMany({ orderBy: [asc(mediaLibrary.originalName)], columns: { id: true, originalName: true } }),
  ])

  const items: BlogPostItem[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category,
    image: r.image,
    content: Array.isArray(r.content) ? (r.content as { heading: string; paragraphs: string[] }[]) : [],
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    readTime: r.readTime,
    status: r.status,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString().slice(0, 10) : '',
    updatedAt: r.updatedAt.toISOString(),
  }))

  return (
    <>
      <PageHeader
        title="Blog Manager"
        description="Create and publish journal articles. Write content as plain text — no HTML needed. Published posts appear on the Blog page and article URLs immediately."
      />
      <BlogManager items={items} mediaOptions={media.map((m) => ({ id: m.id, label: m.originalName }))} />
    </>
  )
}
