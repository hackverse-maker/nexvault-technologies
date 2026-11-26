import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('blog')
}

export default function BlogPage() {
  return <CmsPage slug="blog" />
}
