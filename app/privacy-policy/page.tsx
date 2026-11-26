import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('privacy-policy')
}

export default function PrivacyPolicyPage() {
  return <CmsPage slug="privacy-policy" />
}
