'use client'

import { useState } from 'react'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

const DEVICES = [
  { key: 'desktop', label: 'Desktop', width: '100%', icon: Monitor },
  { key: 'tablet', label: 'Tablet', width: 820, icon: Tablet },
  { key: 'mobile', label: 'Mobile', width: 390, icon: Smartphone },
] as const

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]['key']>('desktop')
  const active = DEVICES.find((d) => d.key === device)!

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {DEVICES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDevice(d.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 7,
              fontSize: 12,
              cursor: 'pointer',
              border: '1px solid var(--line)',
              background: device === d.key ? 'rgba(0,200,255,.12)' : 'transparent',
              color: device === d.key ? 'var(--cyan)' : '#8aa0b8',
            }}
          >
            <d.icon size={14} /> {d.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: active.width,
            maxWidth: '100%',
            border: '1px solid var(--line)',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#020817',
            transition: 'width .25s ease',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
