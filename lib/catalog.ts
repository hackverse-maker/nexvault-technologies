import 'server-only'

import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products, services } from '@/lib/db/schema'
import { digitsOnly } from '@/lib/whatsapp'
import {
  Activity,
  Blocks,
  Briefcase,
  Brush,
  Code2,
  Compass,
  Globe2,
  Layers,
  LineChart,
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
import { iconForService } from '@/lib/icons'

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Code2, ShoppingBag, ShoppingCart, Store, Globe2, Search, Target, Megaphone,
  Sparkles, Brush, Palette, Wrench, Blocks, LineChart, Settings2,
  MapPin, Map, TrendingUp, Users, Layers, PenTool, Compass, Briefcase,
  Monitor, Activity,
}

export const SERVICE_ICON_OPTIONS = Object.keys(SERVICE_ICONS)

export function serviceIcon(name: string | null | undefined): LucideIcon | undefined {
  return name ? SERVICE_ICONS[name] : undefined
}

/** Explicit DB icon first, then slug/title inference — never a bare arrow. */
export function serviceIconFor(service: { icon?: string | null; slug: string; title: string }): LucideIcon {
  return serviceIcon(service.icon) ?? iconForService(service)
}

export type CatalogService = typeof services.$inferSelect
export type CatalogProduct = typeof products.$inferSelect

export async function getCatalogServices(opts: { activeOnly?: boolean; category?: string; homepageOnly?: boolean } = {}): Promise<CatalogService[]> {
  const conditions = []
  if (opts.activeOnly !== false) conditions.push(eq(services.isActive, true))
  if (opts.homepageOnly) conditions.push(eq(services.showOnHomepage, true))
  if (opts.category) conditions.push(eq(services.category, opts.category))
  return db.query.services.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [asc(services.sortOrder), asc(services.title)],
  })
}

export async function getCatalogProducts(opts: { activeOnly?: boolean; category?: string; homepageOnly?: boolean } = {}): Promise<CatalogProduct[]> {
  const conditions = []
  if (opts.activeOnly !== false) conditions.push(eq(products.status, 'active'))
  if (opts.homepageOnly) conditions.push(eq(products.showOnHomepage, true))
  if (opts.category) conditions.push(eq(products.category, opts.category))
  return db.query.products.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [asc(products.sortOrder), asc(products.name)],
  })
}

export function productPrice(p: { price: string; currency: string }): string {
  const n = Number(p.price)
  return `${p.currency} ${Number.isFinite(n) ? n.toLocaleString() : p.price}`
}

export const FALLBACK_WHATSAPP_NUMBER = '923148951060'

export function whatsappInquiryUrl(message: string | null | undefined, number?: string | null): string | null {
  if (!message) return null
  const num = digitsOnly(number) || FALLBACK_WHATSAPP_NUMBER
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

export function serviceFeatures(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((f): f is string => typeof f === 'string') : []
}

export function productFeatures(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((f): f is string => typeof f === 'string') : []
}

export { productInquiryMessage as productInquiryFallback, serviceInquiryMessage as serviceInquiryFallback } from '@/lib/whatsapp'
