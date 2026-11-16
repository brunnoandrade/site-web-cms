import { getServerSideSitemap } from 'next-sitemap'
import { getPagesSitemap } from '@/lib/sitemapEntries'

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  return getServerSideSitemap(await getPagesSitemap(tenant))
}
