import 'server-only'

import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactInformation, whatsappNumbers, whatsappSettings } from '@/lib/db/schema'
import { contact } from '@/lib/contact'

export const DEFAULT_WHATSAPP_NUMBER = '923148951060'

export type WhatsAppNumber = { id: string; label: string; phone: string; sortOrder: number; isActive: boolean }

export type WhatsAppConfig = {
  /** digits-only international number, e.g. 923148951060 */
  number: string
  /** https://wa.me/<number> */
  baseUrl: string
  defaultMessage: string
  widgetEnabled: boolean
  /** 'all' | 'exclude' */
  visibility: string
  /** page paths where the floating widget is hidden (visibility='exclude') */
  hiddenPaths: string[]
  /** additional admin-managed numbers */
  numbers: WhatsAppNumber[]
}

export function digitsOnly(phone: string | null | undefined): string {
  return (phone ?? '').replace(/\D/g, '')
}

export function waLink(number: string, message?: string | null): string {
  const base = `https://wa.me/${digitsOnly(number)}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function productInquiryMessage(name: string): string {
  return `Hello! I am interested in ${name}. Please share more details and pricing.`
}

export function serviceInquiryMessage(title: string): string {
  return `Hello! I am interested in ${title}. Please share more details.`
}

export function generalInquiryMessage(): string {
  return 'Hello! I visited your website and would like to inquire about your services.'
}

const FALLBACK: WhatsAppConfig = {
  number: digitsOnly(contact.whatsappNumber) || DEFAULT_WHATSAPP_NUMBER,
  baseUrl: contact.whatsappUrl !== '#' ? contact.whatsappUrl : `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}`,
  defaultMessage: generalInquiryMessage(),
  widgetEnabled: true,
  visibility: 'all',
  hiddenPaths: [],
  numbers: [],
}

export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  try {
    const [settings, contactRow, numbers] = await Promise.all([
      db.query.whatsappSettings.findFirst({ where: eq(whatsappSettings.id, 1) }),
      db.query.contactInformation.findFirst({ where: eq(contactInformation.id, 1) }),
      db.query.whatsappNumbers.findMany({
        where: eq(whatsappNumbers.isActive, true),
        orderBy: [asc(whatsappNumbers.sortOrder), asc(whatsappNumbers.label)],
      }),
    ])

    const number = digitsOnly(contactRow?.whatsappNumber) || FALLBACK.number

    const hiddenPages = (settings?.hiddenPages ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    return {
      number,
      baseUrl: `https://wa.me/${number}`,
      defaultMessage: settings?.defaultMessage?.trim() || generalInquiryMessage(),
      widgetEnabled: settings?.widgetEnabled ?? true,
      visibility: settings?.visibility === 'exclude' ? 'exclude' : 'all',
      hiddenPaths: hiddenPages,
      numbers: numbers.map((n) => ({ id: n.id, label: n.label, phone: digitsOnly(n.phone), sortOrder: n.sortOrder, isActive: n.isActive })),
    }
  } catch {
    return FALLBACK
  }
}

/** Message used for generic WhatsApp buttons; appends the page URL when provided. */
export function contextualMessage(base: string, pageUrl?: string | null): string {
  if (!pageUrl) return base
  return `${base}\n\nPage: ${pageUrl}`
}
