import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'

export const inputStyle: CSSProperties = {
  width: '100%',
  background: '#091a31',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '10px 13px',
  color: 'white',
  font: 'inherit',
  fontSize: 13,
  outline: 'none',
}

export const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
  color: '#aac0d5',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

export const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  color: '#5f7a99',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: 1,
  borderBottom: '1px solid var(--line)',
}

export const tdStyle: CSSProperties = {
  padding: '12px 14px',
  fontSize: 13,
  color: '#d7e4f2',
  borderBottom: '1px solid rgba(148,163,184,.08)',
  verticalAlign: 'middle',
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 26 }}>
      <div>
        <h1 style={{ fontSize: 30, letterSpacing: '-1px', margin: '0 0 8px' }}>{title}</h1>
        {description && <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, maxWidth: 560 }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 10,
        background: 'linear-gradient(160deg, rgba(18,33,57,.6), rgba(4,13,29,.7))',
        padding: 22,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Badge({ tone = 'cyan', children }: { tone?: 'cyan' | 'green' | 'amber' | 'red' | 'slate'; children: ReactNode }) {
  const colors = {
    cyan: { color: '#70ddff', bg: 'rgba(0,200,255,.1)', border: 'rgba(0,200,255,.3)' },
    green: { color: '#70e6ac', bg: 'rgba(71,226,165,.1)', border: 'rgba(71,226,165,.3)' },
    amber: { color: '#f3ca47', bg: 'rgba(228,184,62,.1)', border: 'rgba(228,184,62,.3)' },
    red: { color: '#f0a3a3', bg: 'rgba(240,120,120,.1)', border: 'rgba(240,120,120,.3)' },
    slate: { color: '#94a3b8', bg: 'rgba(148,163,184,.1)', border: 'rgba(148,163,184,.25)' },
  }[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        ...colors,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </span>
  )
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#5f7a99', fontSize: 13 }}>
      {text}
    </div>
  )
}

export function BackLink({ href = '/admin', label = 'Back to dashboard' }: { href?: string; label?: string }) {
  return (
    <Link href={href} style={{ color: 'var(--cyan)', fontSize: 12, display: 'inline-flex', gap: 6, marginBottom: 18 }}>
      ← {label}
    </Link>
  )
}
