import { getServerSideSitemap } from 'next-sitemap'
import { getPostsSitemap } from '@/lib/sitemapEntries'

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  return getServerSideSitemap(await getPostsSitemap(tenant))
}
