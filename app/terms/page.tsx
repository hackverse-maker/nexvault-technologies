import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('terms')
}

export default function TermsPage() {
  return <CmsPage slug="terms" />
}
