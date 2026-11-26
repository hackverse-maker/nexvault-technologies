import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth/session'
import { LoginForm } from './login-form'
import { Logo } from '@/components/site/logo'

export const metadata = { title: 'Admin Sign In — NexVault Technologies' }
export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const session = await getAdminSession()
  if (session) redirect('/admin')

  return (
    <main
      className="site-shell"
      style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '40px 20px' }}
    >
      <div style={{ width: 'min(420px, 100%)' }}>
        <div style={{ marginBottom: 34, display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </div>
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 12,
            background: 'linear-gradient(160deg, rgba(18,33,57,.9), rgba(4,13,29,.95))',
            padding: '34px 30px',
          }}
        >
          <p className="eyebrow" style={{ textAlign: 'center' }}>NexVault Admin</p>
          <h1 style={{ fontSize: 26, letterSpacing: '-0.5px', margin: '12px 0 8px', textAlign: 'center' }}>
            Sign in to your dashboard
          </h1>
          <p className="section-intro" style={{ textAlign: 'center', marginBottom: 26 }}>
            Manage your website, content, and inquiries.
          </p>
          <LoginForm />
        </div>
        <p style={{ textAlign: 'center', color: '#6f8297', fontSize: 11, marginTop: 22 }}>
          Protected area. Authorized administrators only.
        </p>
      </div>
    </main>
  )
}
