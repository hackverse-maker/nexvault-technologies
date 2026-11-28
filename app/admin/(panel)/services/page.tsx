import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { services } from '@/lib/db/schema'
import { PageHeader } from '@/components/admin/ui'
import { ServiceManager, type ServiceItem } from '@/components/admin/service-manager'
import { SERVICE_ICON_OPTIONS } from '@/lib/catalog'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Services — NexVault Admin' }

export default async function AdminServicesPage() {
  const rows = await db.query.services.findMany({ orderBy: [asc(services.sortOrder), asc(services.title)] })

  const items: ServiceItem[] = rows.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description,
    features: Array.isArray(s.features) ? (s.features as string[]).filter((f): f is string => typeof f === 'string') : [],
    category: s.category,
    icon: s.icon,
    ctaLabel: s.ctaLabel,
    whatsappMessage: s.whatsappMessage,
    showOnHomepage: s.showOnHomepage,
    sortOrder: s.sortOrder,
    isActive: s.isActive,
  }))

  return (
    <>
      <PageHeader
        title="Services Management"
        description="Services shown across the website. Active services appear in service sections and detail pages; homepage-flagged ones appear on the home page."
      />
      <ServiceManager items={items} iconOptions={SERVICE_ICON_OPTIONS} />
    </>
  )
}
