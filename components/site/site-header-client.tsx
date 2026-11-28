'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Logo } from './logo'
import type { ChromeNavItem } from '@/lib/chrome'

export function SiteHeaderClient({
  logoUrl,
  navItems,
  ctaLabel,
  ctaHref,
}: {
  logoUrl: string | null
  navItems: ChromeNavItem[]
  ctaLabel: string
  ctaHref: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        {logoUrl ? (
          <Link href="/" className="flex items-center gap-3" aria-label="NexVault Technologies home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="NexVault Technologies" style={{ height: 40, width: 'auto', maxWidth: 160, objectFit: 'contain' }} />
          </Link>
        ) : (
          <Logo />
        )}
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          {navItems.map((item) =>
            item.children?.length ? (
              <div key={item.href + item.label} className="nav-dropdown">
                <Link
                  href={item.href}
                  className={isActive(item.href) ? 'text-white' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
                <div className="nav-dropdown-menu">
                  {item.children.map((child) => (
                    <Link key={child.href + child.label} href={child.href} onClick={() => setMenuOpen(false)}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={isActive(item.href) ? 'text-white' : undefined}
              >
                {item.label}
              </Link>
            ),
          )}
          <Link className="nav-cta" href={ctaHref} onClick={() => setMenuOpen(false)}>
            {ctaLabel} <ArrowRight size={15} />
          </Link>
        </nav>
        <button
          className="menu-button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
