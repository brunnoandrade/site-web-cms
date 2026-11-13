import { sitemapDates } from '@/lib/lastModified'
import { sitemapIndexXml } from '@/lib/sitemaps'
import { requireTenant } from '@/lib/tenant'

/** /sitemap.xml: the index that points search engines to the pages and posts sitemaps. */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const tenant = await requireTenant((await params).tenant)
  const dates = await sitemapDates(tenant)
  const body = sitemapIndexXml(tenant, [
    { path: '/pages-sitemap.xml', lastmod: dates.pages },
    { path: '/posts-sitemap.xml', lastmod: dates.posts },
  ])
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
