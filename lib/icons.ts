import {
  Activity,
  Blocks,
  Brush,
  Briefcase,
  Code2,
  Compass,
  Globe2,
  Layers,
  LineChart,
  Laptop,
  Map,
  MapPin,
  Megaphone,
  Monitor,
  Palette,
  PenTool,
  Search,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Keyword → icon inference used when no explicit icon is assigned.
 * Keeps decorative icons meaningful instead of generic arrows.
 */
const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/e-?commerce|shop|store|cart|product|checkout/i, ShoppingCart],
  [/map|local|location|nearby|directions/i, Map],
  [/google business|business profile|listing|maps optim/i, MapPin],
  [/seo|search|rank|organic|visibility|get found/i, TrendingUp],
  [/ads|advertis|ppc|campaign|target|market/i, Megaphone],
  [/social|community|content|post/i, Users],
  [/brand|logo|identity|rebrand/i, Brush],
  [/ui|ux|design|palette|visual|interface|figma/i, Palette],
  [/develop|code|web|site|app|software|engineer|build/i, Code2],
  [/analytic|chart|data|metric|report|growth|trend/i, TrendingUp],
  [/maintain|support|repair|update|security|care/i, Wrench],
  [/team|people|collaborat|staff|about/i, Users],
  [/write|blog|content|copy|editorial/i, PenTool],
  [/strategy|plan|consult|advisor/i, Compass],
  [/project|portfolio|work|case|briefcase/i, Briefcase],
  [/monitor|screen|dashboard|desktop/i, Monitor],
  [/laptop|device|mobile|responsive/i, Laptop],
  [/layer|system|stack|module|component/i, Layers],
  [/globe|world|international|remote/i, Globe2],
  [/spark|idea|innovate|creative/i, Sparkles],
  [/target|goal|objective|kpi/i, Target],
  [/activity|performance|speed/i, Activity],
  [/line|graph|stat/i, LineChart],
]

export const FALLBACK_ICON: LucideIcon = Sparkles

/** Pick a meaningful icon from free-text (service title, feature name, etc.). */
export function iconForTitle(title: string | null | undefined): LucideIcon {
  if (!title) return FALLBACK_ICON
  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(title)) return icon
  }
  return FALLBACK_ICON
}

/** Icon by catalog slug, mirroring the site's service taxonomy. */
export const SLUG_ICONS: Record<string, LucideIcon> = {
  'web-development': Code2,
  ecommerce: ShoppingCart,
  'google-business-profile': MapPin,
  'local-seo': Map,
  seo: TrendingUp,
  'google-ads': Target,
  'social-ads': Megaphone,
  'social-media': Users,
  'ui-ux-design': Palette,
  branding: Brush,
  maintenance: Wrench,
}

export function iconForSlug(slug: string | null | undefined): LucideIcon | undefined {
  return slug ? SLUG_ICONS[slug] : undefined
}

/**
 * Resolve the best icon for a catalog service: explicit DB icon name is
 * handled by the caller; this covers slug → title → neutral fallback.
 */
export function iconForService(service: { slug?: string | null; title?: string | null }): LucideIcon {
  return iconForSlug(service.slug) ?? iconForTitle(service.title)
}

/** Name → component map for pickers (admin icon selector). Client-safe. */
export const ICON_OPTIONS: Record<string, LucideIcon> = {
  Code2, ShoppingBag, ShoppingCart, Store, Globe2, Search, Target, Megaphone,
  Sparkles, Brush, Palette, Wrench, Blocks, LineChart, Settings2,
  MapPin, Map, TrendingUp, Users, Layers, PenTool, Compass, Briefcase,
  Monitor, Activity, Laptop,
}
