import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export function generateMetadata() {
  return getCmsMetadata('contact')
}

export default function ContactPage() {
  return <CmsPage slug="contact" />
}
