import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mediaLibrary, products } from '@/lib/db/schema'
import { PageHeader } from '@/components/admin/ui'
import { ProductManager, type ProductItem } from '@/components/admin/product-manager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Products — NexVault Admin' }

export default async function AdminProductsPage() {
  const [rows, media] = await Promise.all([
    db.query.products.findMany({ orderBy: [asc(products.sortOrder), asc(products.name)] }),
    db.query.mediaLibrary.findMany({ orderBy: [asc(mediaLibrary.originalName)] }),
  ])

  const items: ProductItem[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: String(p.price),
    comparePrice: p.comparePrice === null ? null : String(p.comparePrice),
    currency: p.currency,
    features: Array.isArray(p.features) ? (p.features as string[]).filter((f): f is string => typeof f === 'string') : [],
    category: p.category,
    ctaLabel: p.ctaLabel,
    whatsappMessage: p.whatsappMessage,
    showOnHomepage: p.showOnHomepage,
    isPopular: p.isPopular,
    mediaId: p.mediaId,
    status: p.status,
    sortOrder: p.sortOrder,
  }))

  const mediaOptions = media.map((m) => ({ id: m.id, label: m.originalName }))

  return (
    <>
      <PageHeader
        title="Products Management"
        description="Products, packages, and pricing shown on the website. Active products appear in pricing sections; homepage-flagged ones appear on the home page."
      />
      <ProductManager items={items} mediaOptions={mediaOptions} />
    </>
  )
}
