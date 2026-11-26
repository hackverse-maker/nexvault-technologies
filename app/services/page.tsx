import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('services')
}

export default function ServicesPage() {
  return <CmsPage slug="services" />
}
