import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('pricing')
}

export default function PricingPage() {
  return <CmsPage slug="pricing" />
}
