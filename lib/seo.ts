import { createElement } from 'react'
import type { Metadata } from 'next'
import { contact, company } from '@/lib/contact'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
export const SITE_NAME = company.name
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.svg`

export const DEFAULT_DESCRIPTION =
  'NexVault Technologies builds premium websites, digital brands, and growth systems for ambitious businesses.'

export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string
  description?: string | null
  path: string
  image?: string | null
}): Metadata {
  const url = `${SITE_URL}${path}`
  const desc = description?.trim() || DEFAULT_DESCRIPTION
  const ogImage = image?.trim() || DEFAULT_OG_IMAGE
  const fullTitle = title.includes('NexVault') ? title : `${title} — ${SITE_NAME}`
  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
  }
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, '\\u003c') },
  })
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: contact.email,
    telephone: contact.phoneOne,
    sameAs: [contact.instagram, contact.facebook].filter(Boolean),
    slogan: company.tagline,
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function serviceJsonLd(service: { title: string; description: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
}
