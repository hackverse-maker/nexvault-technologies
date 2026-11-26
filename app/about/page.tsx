import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('about')
}

export default function AboutPage() {
  return <CmsPage slug="about" />
}
