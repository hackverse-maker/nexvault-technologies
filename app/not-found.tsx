import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="site-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <p className="eyebrow">404</p>
        <h1 style={{ margin: '16px 0 14px' }}>This page took a wrong turn.</h1>
        <p className="section-intro" style={{ margin: '0 auto 32px' }}>
          The page you are looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link className="button primary" href="/">
            <ArrowLeft size={17} /> Back to home
          </Link>
          <Link className="text-link" href="/services">
            Browse services <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  )
}
