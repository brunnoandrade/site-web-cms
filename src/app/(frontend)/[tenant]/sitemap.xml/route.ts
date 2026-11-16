import { getServerSideSitemap } from 'next-sitemap'

import { getPagesSitemap, getPostsSitemap } from '@/lib/sitemapEntries'
import { mergeSitemapEntries } from '@/lib/sitemaps'

/**
 * /sitemap.xml: every page and post of the property in one file, as the current Uber Conta site
 * does. pages-sitemap.xml and posts-sitemap.xml keep serving the same URLs, split.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [pages, posts] = await Promise.all([getPagesSitemap(tenant), getPostsSitemap(tenant)])
  return getServerSideSitemap(mergeSitemapEntries(pages, posts))
}
