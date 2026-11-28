'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import { Card, inputStyle, labelStyle } from './ui'
import { FONT_OPTIONS, RADIUS_OPTIONS, SPACING_OPTIONS, type DesignValues } from '@/lib/design-options'
import { saveDesignSettingsAction } from '@/app/admin/(panel)/actions'

const COLOR_FIELDS: { key: keyof DesignValues; label: string; help: string; fallback: string }[] = [
  { key: 'primary', label: 'Primary color', help: 'Buttons, links and accents (default blue #008cff)', fallback: '#008cff' },
  { key: 'accent', label: 'Accent color', help: 'Highlights and secondary accents (default cyan #00c8ff)', fallback: '#00c8ff' },
  { key: 'background', label: 'Page background', help: 'Main site background (default #020817)', fallback: '#020817' },
  { key: 'surface', label: 'Card / panel background', help: 'Cards and panels (default #07152b)', fallback: '#07152b' },
  { key: 'text', label: 'Heading text color', help: 'Main headings (default #f8fafc)', fallback: '#f8fafc' },
  { key: 'muted', label: 'Body text color', help: 'Paragraphs and secondary text (default #94a3b8)', fallback: '#94a3b8' },
  { key: 'border', label: 'Border color', help: 'Card and section borders', fallback: 'rgba(148,163,184,.16)' },
]

function ColorField({ field, value, onChange }: { field: (typeof COLOR_FIELDS)[number]; value: string; onChange: (v: string) => void }) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : field.fallback
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${field.label} picker`}
          style={{ width: 44, height: 40, padding: 3, background: '#091a31', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer' }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.fallback}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
          aria-label={field.label}
        />
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ background: 'none', border: 'none', color: '#5f7a99', cursor: 'pointer', fontSize: 11 }}>
            Reset
          </button>
        )}
      </div>
      <p style={{ margin: 0, color: '#5f7a99', fontSize: 10 }}>{field.help}</p>
    </div>
  )
}

export function DesignManager({ values }: { values: DesignValues }) {
  const router = useRouter()
  const [v, setV] = useState<DesignValues>({ ...values })
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof DesignValues>(key: K, value: DesignValues[K]) => setV((p) => ({ ...p, [key]: value }))

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await saveDesignSettingsAction(fd)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <h2 style={{ fontSize: 15, margin: '0 0 4px' }}>Colors</h2>
        <p style={{ margin: '0 0 18px', color: '#5f7a99', fontSize: 12 }}>Pick a color or type a hex / rgb value. Clear a field to restore the default.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {COLOR_FIELDS.map((f) => (
            <ColorField key={f.key} field={f} value={String(v[f.key] ?? '')} onChange={(val) => set(f.key, val)} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: 15, margin: '0 0 4px' }}>Typography</h2>
        <p style={{ margin: '0 0 18px', color: '#5f7a99', fontSize: 12 }}>Fonts are loaded from Google Fonts automatically.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <label style={labelStyle}>Heading font
            <select name="headingFont" value={String(v.headingFont ?? 'default')} onChange={(e) => set('headingFont', e.target.value)} style={inputStyle}>
              {FONT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label style={labelStyle}>Body font
            <select name="bodyFont" value={String(v.bodyFont ?? 'default')} onChange={(e) => set('bodyFont', e.target.value)} style={inputStyle}>
              {FONT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label style={labelStyle}>Base font size: {v.baseFontSize ?? 16}px
            <input name="baseFontSize" type="range" min={13} max={20} step={1} value={Number(v.baseFontSize ?? 16)} onChange={(e) => set('baseFontSize', Number(e.target.value))} style={{ accentColor: 'var(--cyan)' }} />
          </label>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: 15, margin: '0 0 4px' }}>Layout & spacing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <label style={labelStyle}>Content width: {v.contentWidth ? `${v.contentWidth}px` : 'default'}
            <input name="contentWidth" type="range" min={0} max={1600} step={40} value={Number(v.contentWidth ?? 0)} onChange={(e) => set('contentWidth', Number(e.target.value))} style={{ accentColor: 'var(--cyan)' }} />
            <span style={{ color: '#5f7a99', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>0 = site default container width</span>
          </label>
          <label style={labelStyle}>Section spacing
            <select name="sectionSpacing" value={String(v.sectionSpacing ?? 'default')} onChange={(e) => set('sectionSpacing', e.target.value)} style={inputStyle}>
              {SPACING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label style={labelStyle}>Corner radius: {v.borderRadius ?? 12}px
            <input name="borderRadius" type="range" min={0} max={28} step={1} value={Number(v.borderRadius ?? 12)} onChange={(e) => set('borderRadius', Number(e.target.value))} style={{ accentColor: 'var(--cyan)' }} />
          </label>
          <label style={labelStyle}>Button shape
            <select name="buttonRadius" value={String(v.buttonRadius ?? 'pill')} onChange={(e) => set('buttonRadius', e.target.value)} style={inputStyle}>
              {RADIUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: 15, margin: '0 0 4px' }}>Effects & branding</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#aac0d5', fontSize: 12, cursor: 'pointer' }}>
            <input type="checkbox" name="cardShadow" value="true" checked={v.cardShadow === true} onChange={(e) => set('cardShadow', e.target.checked)} />
            Soft shadows on cards
          </label>
          <label style={labelStyle}>Custom favicon URL (optional)
            <input name="faviconUrl" value={String(v.faviconUrl ?? '')} onChange={(e) => set('faviconUrl', e.target.value)} placeholder="https://… or /api/img/…" style={inputStyle} />
            <span style={{ color: '#5f7a99', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>Overrides the default NexVault favicon when set.</span>
          </label>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="button primary" type="submit" disabled={pending} style={{ padding: '12px 22px' }}>
          {pending ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /> Save design</>}
        </button>
        {saved && <span style={{ color: '#70e6ac', fontSize: 13 }}>Design saved — live on the site.</span>}
        <button
          type="button"
          onClick={() => { setV({ ...values }); router.refresh() }}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--line)', color: '#8aa0b8', borderRadius: 7, padding: '10px 14px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', gap: 6, alignItems: 'center' }}
        >
          <RotateCcw size={13} /> Reset to saved
        </button>
      </div>
    </form>
  )
}
