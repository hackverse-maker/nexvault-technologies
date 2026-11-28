// Client-safe design settings constants & types (no server imports).

export const FONT_OPTIONS = [
  { value: 'default', label: 'Default (system)' },
  { value: 'inter', label: 'Inter' },
  { value: 'space-grotesk', label: 'Space Grotesk' },
  { value: 'sora', label: 'Sora' },
  { value: 'manrope', label: 'Manrope' },
  { value: 'outfit', label: 'Outfit' },
] as const

export const FONT_FAMILIES: Record<string, string> = {
  inter: 'Inter',
  'space-grotesk': 'Space Grotesk',
  sora: 'Sora',
  manrope: 'Manrope',
  outfit: 'Outfit',
}

export const SPACING_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'spacious', label: 'Spacious' },
] as const

export const RADIUS_OPTIONS = [
  { value: 'pill', label: 'Pill (round)' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Slightly rounded' },
] as const

export type DesignValues = {
  primary?: string
  accent?: string
  background?: string
  surface?: string
  text?: string
  muted?: string
  border?: string
  headingFont?: string
  bodyFont?: string
  baseFontSize?: number
  contentWidth?: number
  sectionSpacing?: string
  borderRadius?: number
  buttonRadius?: string
  cardShadow?: boolean
  faviconUrl?: string
}
