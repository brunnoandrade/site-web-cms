import 'server-only'

import { find, type Tenant } from '@/lib/cms'
import { latestDate } from '@/lib/sitemaps'

const latestOf = async (
  tenant: Tenant,
  collection: 'pages' | 'posts' | 'categories' | 'help-topics' | 'faqs',
  published: boolean,
) => {
  const { docs } = await find(collection, {
    tenant: tenant.slug,
    depth: 0,
    limit: 1,
    pagination: false,
    sort: '-updatedAt',
    select: { updatedAt: true },
    ...(published ? { where: { _status: { equals: 'published' } } } : {}),
  })
  return docs[0]?.updatedAt
}

/**
 * Date of the latest content change of each sitemap (never "now": a lastmod that always moves makes
 * search engines ignore it). A property without content uses its own update date.
 */
export const sitemapDates = async (tenant: Tenant) => {
  const [pages, posts, categories, topics, faqs] = await Promise.all([
    latestOf(tenant, 'pages', true),
    latestOf(tenant, 'posts', true),
    latestOf(tenant, 'categories', false),
    latestOf(tenant, 'help-topics', false),
    latestOf(tenant, 'faqs', false),
  ])
  return {
    posts: latestDate([posts], tenant.updatedAt),
    // The pages sitemap also lists the blog index, categories and the help center.
    pages: latestDate([pages, posts, categories, topics, faqs], tenant.updatedAt),
  }
}
