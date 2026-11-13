import { getServerSideSitemap } from 'next-sitemap'
import { find } from '@/lib/cms'
import { sitemapDates } from '@/lib/lastModified'
import { postSitemapEntry } from '@/lib/sitemaps'
import { requireTenant } from '@/lib/tenant'
import { pathsOf } from '@/lib/urlStyle'

const getPostsSitemap = async (tenantSlug: string) => {
  const tenant = await requireTenant(tenantSlug)

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
      title: true,
      updatedAt: true,
      category: true,
      heroImage: true,
      meta: true,
    },
  })

  const dateFallback = (await sitemapDates(tenant)).posts

  const sitemap = (results.docs ?? []).flatMap((post) => {
    const path = pathsOf(tenant).document('posts', post)
    return path ? [postSitemapEntry(tenant, post, path, dateFallback)] : []
  })

  return sitemap
}

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const sitemap = await getPostsSitemap(tenant)

  return getServerSideSitemap(sitemap)
}
