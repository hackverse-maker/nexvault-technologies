import 'server-only'

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { designSettings } from '@/lib/db/schema'
import {
  FONT_FAMILIES,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  SPACING_OPTIONS,
  type DesignValues,
} from '@/lib/design-options'

export { FONT_OPTIONS, RADIUS_OPTIONS, SPACING_OPTIONS }
export type { DesignValues }

export const DESIGN_DEFAULTS: Required<Omit<DesignValues, 'faviconUrl'>> & { faviconUrl: string } = {
  primary: '',
  accent: '',
  background: '',
  surface: '',
  text: '',
  muted: '',
  border: '',
  headingFont: 'default',
  bodyFont: 'default',
  baseFontSize: 16,
  contentWidth: 0,
  sectionSpacing: 'default',
  borderRadius: 12,
  buttonRadius: 'pill',
  cardShadow: false,
  faviconUrl: '',
}

const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%]+\))$/
const URL_RE = /^(https?:\/\/|\/)/

function cleanColor(v: unknown): string | undefined {
  const s = String(v ?? '').trim()
  return COLOR_RE.test(s) ? s : undefined
}

function cleanUrl(v: unknown): string | undefined {
  const s = String(v ?? '').trim()
  return URL_RE.test(s) && s.length < 500 ? s : undefined
}

function cleanFont(v: unknown): string {
  const s = String(v ?? 'default')
  return FONT_FAMILIES[s] ? s : 'default'
}

/** Merge stored JSONB into validated design values (unknown keys dropped). */
export function sanitizeDesignValues(raw: unknown): DesignValues {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const num = (v: unknown, min: number, max: number, fallback: number) => {
    const n = Number(v)
    return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : fallback
  }
  return {
    primary: cleanColor(src.primary),
    accent: cleanColor(src.accent),
    background: cleanColor(src.background),
    surface: cleanColor(src.surface),
    text: cleanColor(src.text),
    muted: cleanColor(src.muted),
    border: cleanColor(src.border),
    headingFont: cleanFont(src.headingFont),
    bodyFont: cleanFont(src.bodyFont),
    baseFontSize: num(src.baseFontSize, 13, 20, DESIGN_DEFAULTS.baseFontSize),
    contentWidth: num(src.contentWidth, 0, 1800, 0),
    sectionSpacing: ['compact', 'default', 'spacious'].includes(String(src.sectionSpacing)) ? String(src.sectionSpacing) : 'default',
    borderRadius: num(src.borderRadius, 0, 28, DESIGN_DEFAULTS.borderRadius),
    buttonRadius: RADIUS_OPTIONS.some((o) => o.value === src.buttonRadius) ? String(src.buttonRadius) : 'pill',
    cardShadow: src.cardShadow === true,
    faviconUrl: cleanUrl(src.faviconUrl),
  }
}

export async function getDesignValues(): Promise<DesignValues> {
  try {
    const row = await db.query.designSettings.findFirst({ where: eq(designSettings.id, 1) })
    return sanitizeDesignValues(row?.values)
  } catch {
    return sanitizeDesignValues({})
  }
}

const SECTION_PAD: Record<string, number> = { compact: 56, default: 88, spacious: 120 }

/** Build the CSS + font links injected into the root layout. */
export function designCss(values: DesignValues): { css: string; fonts: string[] } {
  const v = { ...DESIGN_DEFAULTS, ...values }
  const decl: string[] = []
  if (v.primary) decl.push(`--blue:${v.primary}`)
  if (v.accent) decl.push(`--cyan:${v.accent}`)
  if (v.background) decl.push(`--bg:${v.background}`)
  if (v.surface) decl.push(`--surface:${v.surface}`)
  if (v.text) decl.push(`--white:${v.text}`)
  if (v.muted) decl.push(`--muted:${v.muted}`)
  if (v.border) decl.push(`--line:${v.border}`)

  const rules: string[] = []
  if (decl.length) rules.push(`:root{${decl.join(';')}}`)

  const fonts = new Set<string>()
  const fontStack = (key: string) => {
    const family = FONT_FAMILIES[key]
    if (!family) return null
    fonts.add(`${family.replaceAll(' ', '+')}:wght@400;500;600;700;800`)
    return `'${family}',ui-sans-serif,system-ui,sans-serif`
  }
  const headingStack = fontStack(v.headingFont)
  const bodyStack = fontStack(v.bodyFont)
  if (headingStack || bodyStack) {
    const parts: string[] = []
    if (bodyStack) parts.push(`body{font-family:${bodyStack}}`)
    if (headingStack) parts.push(`h1,h2,h3,h4,.font-heading,.eyebrow{font-family:${headingStack}}`)
    rules.push(parts.join(''))
  }
  if (v.baseFontSize !== 16) rules.push(`html{font-size:${v.baseFontSize}px}`)
  if (v.contentWidth > 0) rules.push(`.container{max-width:${v.contentWidth}px!important}`)
  if (v.sectionSpacing !== 'default') {
    const pad = SECTION_PAD[v.sectionSpacing]
    rules.push(`.section{padding-top:${pad}px;padding-bottom:${pad}px}`)
  }
  if (v.borderRadius !== 12) {
    rules.push(`.service-card,.price-card,.work-card,.stat-card,.portfolio-card,.contact-form,.checkout-form,.order-summary,.pay-option,.blog-card{border-radius:${v.borderRadius}px}`)
  }
  const btnRadius = v.buttonRadius === 'pill' ? '999px' : v.buttonRadius === 'square' ? '4px' : '10px'
  if (v.buttonRadius !== 'pill') rules.push(`.button{border-radius:${btnRadius}!important}`)
  if (v.cardShadow) {
    rules.push(`.service-card,.price-card,.work-card,.stat-card,.portfolio-card,.checkout-form,.order-summary{box-shadow:0 18px 50px rgba(0,0,0,.35)}`)
  }

  return { css: rules.join('\n'), fonts: [...fonts] }
}
