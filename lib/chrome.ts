import 'server-only'

import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  contactInformation,
  footerColumns,
  footerConfiguration,
  headerSettings,
  mediaLibrary,
  navigationItems,
  pages,
  socialMediaLinks,
} from '@/lib/db/schema'
import { contact } from '@/lib/contact'
import { navigation, footerLinks, footerServices } from '@/lib/site-data'

export type ChromeNavItem = { label: string; href: string }
export type FooterColumnData = { id: string; title: string; links: ChromeNavItem[] }

export type HeaderData = {
  logoUrl: string | null
  navItems: ChromeNavItem[]
  ctaLabel: string
  ctaHref: string
  whatsappUrl: string | null
}

export type FooterData = {
  logoUrl: string | null
  heading: string
  description: string
  copyrightText: string
  showSocialLinks: boolean
  columns: FooterColumnData[]
  socials: { label: string; href: string }[]
  contactLine: string | null
  whatsappUrl: string
}

const FALLBACK_HEADER: HeaderData = {
  logoUrl: null,
  navItems: navigation.map((n) => ({ label: n.label, href: n.href })),
  ctaLabel: 'Get a free quote',
  ctaHref: '/get-a-quote',
  whatsappUrl: contact.whatsappUrl,
}

function fallbackFooter(): FooterData {
  return {
    logoUrl: null,
    heading: 'Build. Rank. Grow.',
    description: 'Independent digital strategy, design, and engineering for ambitious businesses.',
    copyrightText: '© 2026 NexVault Technologies. All Rights Reserved.',
    showSocialLinks: true,
    columns: [
      { id: 'pages', title: 'Pages', links: footerLinks.map((l) => ({ label: l.label, href: l.href })) },
      { id: 'services', title: 'Services', links: footerServices.map((s) => ({ label: s.title, href: `/services/${s.slug}` })) },
    ],
    socials: [
      { label: 'Instagram', href: contact.instagram },
      { label: 'Facebook', href: contact.facebook },
      { label: 'WhatsApp', href: contact.whatsappUrl },
    ],
    contactLine: contact.email,
    whatsappUrl: contact.whatsappUrl,
  }
}

async function navHrefs(items: { targetPageId: string | null; targetUrl: string | null }[]): Promise<string[]> {
  const pageIds = [...new Set(items.map((i) => i.targetPageId).filter((id): id is string => Boolean(id)))]
  const pageRows = pageIds.length ? await db.query.pages.findMany({ where: inArray(pages.id, pageIds) }) : []
  const slugById = new Map(pageRows.map((p) => [p.id, p.slug]))
  return items.map((item) => {
    if (item.targetUrl) return item.targetUrl
    const slug = item.targetPageId ? slugById.get(item.targetPageId) : undefined
    return slug ? `/${slug}` : '#'
  })
}

export async function getHeaderData(): Promise<HeaderData> {
  try {
    const [settings, items, contactRow] = await Promise.all([
      db.query.headerSettings.findFirst({ where: eq(headerSettings.id, 1) }),
      db.query.navigationItems.findMany({
        where: and(eq(navigationItems.location, 'header'), eq(navigationItems.isVisible, true)),
        orderBy: [asc(navigationItems.sortOrder)],
      }),
      db.query.contactInformation.findFirst({ where: eq(contactInformation.id, 1) }),
    ])

    const hrefs = await navHrefs(items)
    const navItems = items
      .map((item, i) => ({ label: item.label, href: hrefs[i] }))
      .filter((i) => i.href !== '#')

    let logoUrl: string | null = null
    if (settings?.logoMediaId) {
      const media = await db.query.mediaLibrary.findFirst({ where: eq(mediaLibrary.id, settings.logoMediaId) })
      logoUrl = media?.publicUrl ?? null
    }

    const whatsappNumber =
      settings?.whatsappNumber?.replace(/\D/g, '') ||
      contactRow?.whatsappNumber?.replace(/\D/g, '') ||
      contact.whatsappNumber

    return {
      logoUrl,
      navItems: navItems.length ? navItems : FALLBACK_HEADER.navItems,
      ctaLabel: settings?.ctaLabel || FALLBACK_HEADER.ctaLabel,
      ctaHref: settings?.ctaHref || FALLBACK_HEADER.ctaHref,
      whatsappUrl: settings?.whatsappEnabled === false ? null : `https://wa.me/${whatsappNumber}`,
    }
  } catch {
    return FALLBACK_HEADER
  }
}

export async function getFooterData(): Promise<FooterData> {
  try {
    const [config, columns, items, socials, contactRow] = await Promise.all([
      db.query.footerConfiguration.findFirst({ where: eq(footerConfiguration.id, 1) }),
      db.query.footerColumns.findMany({
        where: eq(footerColumns.isVisible, true),
        orderBy: [asc(footerColumns.sortOrder)],
      }),
      db.query.navigationItems.findMany({
        where: and(eq(navigationItems.location, 'footer'), eq(navigationItems.isVisible, true)),
        orderBy: [asc(navigationItems.sortOrder)],
      }),
      db.query.socialMediaLinks.findMany({
        where: eq(socialMediaLinks.isVisible, true),
        orderBy: [asc(socialMediaLinks.sortOrder)],
      }),
      db.query.contactInformation.findFirst({ where: eq(contactInformation.id, 1) }),
    ])

    const hrefs = await navHrefs(items)
    const mediaRows = config?.logoMediaId
      ? await db.query.mediaLibrary.findMany({ where: eq(mediaLibrary.id, config.logoMediaId) })
      : []

    const grouped = new Map<string, ChromeNavItem[]>()
    const ungrouped: ChromeNavItem[] = []
    items.forEach((item, i) => {
      const link = { label: item.label, href: hrefs[i] }
      if (item.footerColumnId) {
        const list = grouped.get(item.footerColumnId) ?? []
        list.push(link)
        grouped.set(item.footerColumnId, list)
      } else {
        ungrouped.push(link)
      }
    })

    const columnList: FooterColumnData[] = columns.map((col) => ({
      id: col.id,
      title: col.title,
      links: grouped.get(col.id) ?? [],
    }))

    if (ungrouped.length > 0) {
      if (columnList.length === 0) columnList.push({ id: 'links', title: 'Explore', links: [] })
      columnList[0].links.push(...ungrouped)
    }

    const fallback = fallbackFooter()
    const finalColumns = columnList.filter((c) => c.links.length > 0)

    return {
      logoUrl: mediaRows[0]?.publicUrl ?? null,
      heading: config?.heading || fallback.heading,
      description: config?.description || fallback.description,
      copyrightText: config?.copyrightText || fallback.copyrightText,
      showSocialLinks: config?.showSocialLinks ?? true,
      columns: finalColumns.length ? finalColumns : fallback.columns,
      socials: socials.length > 0 ? socials.map((s) => ({ label: s.label, href: s.url })) : fallback.socials,
      contactLine: contactRow?.businessEmail || contact.email,
      whatsappUrl: contactRow?.whatsappNumber
        ? `https://wa.me/${contactRow.whatsappNumber.replace(/\D/g, '')}`
        : contact.whatsappUrl,
    }
  } catch {
    return fallbackFooter()
  }
}
