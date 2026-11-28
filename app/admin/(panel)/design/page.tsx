import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { designSettings } from '@/lib/db/schema'
import { sanitizeDesignValues } from '@/lib/design'
import { PageHeader } from '@/components/admin/ui'
import { DesignManager } from '@/components/admin/design-manager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Design — NexVault Admin' }

export default async function AdminDesignPage() {
  const row = await db.query.designSettings.findFirst({ where: eq(designSettings.id, 1) })
  const values = sanitizeDesignValues(row?.values)

  return (
    <>
      <PageHeader
        title="Design Settings"
        description="Customize colors, typography, layout spacing, and effects visually — no code required. The default NexVault theme is used for anything left untouched."
      />
      <DesignManager values={values} />
    </>
  )
}
