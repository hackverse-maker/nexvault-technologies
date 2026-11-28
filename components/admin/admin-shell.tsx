'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  FileText,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Menu,
  Search,
  Settings,
  PanelTop,
  PanelBottom,
  Image as ImageIcon,
  Package,
  Wrench,
  Inbox,
  MessageCircle,
  Receipt,
  Newspaper,
  Palette,
  X,
} from 'lucide-react'
import { Logo } from '@/components/site/logo'
import { logoutAction } from '@/app/admin/login/actions'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pages', label: 'Pages Management', icon: FileText },
  { href: '/admin/sections', label: 'Section Management', icon: LayoutList },
  { href: '/admin/business', label: 'Business Information', icon: Building2 },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/admin/settings', label: 'Website Settings', icon: Settings },
  { href: '/admin/header', label: 'Header Management', icon: PanelTop },
  { href: '/admin/footer', label: 'Footer Management', icon: PanelBottom },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
  { href: '/admin/products', label: 'Products Management', icon: Package },
  { href: '/admin/services', label: 'Services Management', icon: Wrench },
  { href: '/admin/orders', label: 'Orders', icon: Receipt },
  { href: '/admin/blog', label: 'Blog Manager', icon: Newspaper },
  { href: '/admin/design', label: 'Design Settings', icon: Palette },
  { href: '/admin/inquiries', label: 'Contact Inquiries', icon: Inbox },
  { href: '/admin/seo', label: 'SEO Management', icon: Search },
]

export function AdminShell({
  userName,
  userEmail,
  role,
  children,
}: {
  userName: string
  userEmail: string
  role: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(
    () => navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  const isActive = (item: (typeof navItems)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 40 }}
        />
      )}
      <aside
        style={{
          width: 250,
          flexShrink: 0,
          borderRight: '1px solid var(--line)',
          background: '#050d1c',
          padding: '22px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          position: 'fixed',
          inset: '0 auto 0 0',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s ease',
        }}
        className="admin-sidebar"
      >
        <div style={{ padding: '0 8px 18px', borderBottom: '1px solid var(--line)' }}>
          <Logo />
          <p style={{ color: '#5f7a99', fontSize: 10, letterSpacing: 2, marginTop: 8, textTransform: 'uppercase' }}>
            Admin Panel
          </p>
        </div>
        <div style={{ position: 'relative', margin: '14px 0' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#5f7a99' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules…"
            style={{
              width: '100%',
              background: '#091a31',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '9px 10px 9px 30px',
              color: 'white',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', flex: 1 }}>
          {filtered.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 12px',
                  borderRadius: 7,
                  fontSize: 13,
                  color: active ? 'white' : '#8aa0b8',
                  background: active ? 'rgba(0,200,255,.1)' : 'transparent',
                  borderLeft: active ? '2px solid var(--cyan)' : '2px solid transparent',
                }}
              >
                <item.icon size={16} style={{ color: active ? 'var(--cyan)' : '#5f7a99' }} />
                {item.label}
              </Link>
            )
          })}
          {filtered.length === 0 && (
            <p style={{ color: '#5f7a99', fontSize: 12, padding: '10px 12px' }}>No modules match your search.</p>
          )}
        </nav>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 12px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#008cff,#00c8ff)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 14,
                color: '#001426',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#5f7a99', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 7,
                border: '1px solid rgba(240,163,163,.25)',
                background: 'rgba(240,163,163,.06)',
                color: '#f0a3a3',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: 250, minWidth: 0, display: 'flex', flexDirection: 'column' }} className="admin-main">
        <header
          style={{
            height: 64,
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '0 24px',
            background: 'rgba(2,8,23,.85)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <button
            className="menu-button"
            style={{ display: 'block' }}
            aria-label="Toggle navigation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p style={{ color: '#5f7a99', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>
            NexVault Technologies · {role === 'admin' ? 'Administrator' : 'Editor'}
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: 'auto', color: 'var(--cyan)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            View website ↗
          </a>
        </header>
        <main style={{ padding: '28px 24px 60px', flex: 1 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar { box-shadow: 0 0 60px rgba(0,0,0,.5); }
          .admin-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
