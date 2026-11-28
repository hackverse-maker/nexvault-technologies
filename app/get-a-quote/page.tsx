import { CmsPage, getCmsMetadata } from '@/components/site/cms-page'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ package?: string }> }) {
  const { package: pkg } = await searchParams
  void pkg
  return getCmsMetadata('get-a-quote')
}

export default async function GetAQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>
}) {
  const { package: pkg } = await searchParams
  return <CmsPage slug="get-a-quote" contactPackage={pkg} />
}
