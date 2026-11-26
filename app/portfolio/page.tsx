import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('portfolio')
}

export default function PortfolioPage() {
  return <CmsPage slug="portfolio" />
}
