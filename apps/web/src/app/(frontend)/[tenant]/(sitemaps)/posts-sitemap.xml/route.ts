import { getServerSideSitemap } from 'next-sitemap'
import { documentPath } from '@digio/routes'
import { find } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'

const getPostsSitemap = async (tenantSlug: string) => {
  const tenant = await requireTenant(tenantSlug)
  const SITE_URL = tenant.siteUrl

  const results = await find('posts', {
    tenant: tenant.slug,
    tags: ['posts-sitemap'],
    depth: 1,
    limit: 1000,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    // The category (populated) is part of the post URL.
    select: {
      slug: true,
      updatedAt: true,
      category: true,
    },
  })

  const dateFallback = new Date().toISOString()

  const sitemap = results.docs
    ? results.docs
        .map((post) => ({ post, path: documentPath('posts', post) }))
        .filter(({ path }) => Boolean(path))
        .map(({ post, path }) => ({
          loc: `${SITE_URL}${path}`,
          lastmod: post.updatedAt || dateFallback,
        }))
    : []

  return sitemap
}

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const sitemap = await getPostsSitemap(tenant)

  return getServerSideSitemap(sitemap)
}
