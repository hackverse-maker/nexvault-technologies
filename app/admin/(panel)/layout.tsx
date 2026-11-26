import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/session'
import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <AdminShell userName={session.name} userEmail={session.email} role={session.role}>
      {children}
    </AdminShell>
  )
}
