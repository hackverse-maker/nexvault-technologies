import { getHeaderData } from '@/lib/chrome'
import { SiteHeaderClient } from './site-header-client'

export async function SiteHeader() {
  const data = await getHeaderData()
  return <SiteHeaderClient {...data} />
}
