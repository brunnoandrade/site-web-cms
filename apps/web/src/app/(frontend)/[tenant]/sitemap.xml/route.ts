import { requireTenant } from '@/lib/tenant'

/** /sitemap.xml: the index that points search engines to the pages and posts sitemaps. */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const tenant = await requireTenant((await params).tenant)
  const lastmod = new Date().toISOString()
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${tenant.siteUrl}/pages-sitemap.xml</loc><lastmod>${lastmod}</lastmod></sitemap>
  <sitemap><loc>${tenant.siteUrl}/posts-sitemap.xml</loc><lastmod>${lastmod}</lastmod></sitemap>
</sitemapindex>
`
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
