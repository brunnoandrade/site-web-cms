import { getServerSideSitemap } from 'next-sitemap'
import {
  blogCategoryPath,
  blogIndexPath,
  helpIndexPath,
  helpQuestionPath,
  helpTopicPath,
  pagePath,
} from '@digio/routes'
import { find } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'

const getPagesSitemap = async (tenantSlug: string) => {
  const tenant = await requireTenant(tenantSlug)
  const SITE_URL = tenant.siteUrl

  const results = await find('pages', {
    tenant: tenant.slug,
    tags: ['pages-sitemap'],
    depth: 0,
    limit: 1000,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const categories = await find('categories', {
    tenant: tenant.slug,
    depth: 0,
    limit: 1000,
    pagination: false,
    select: { slug: true, updatedAt: true },
  })

  const helpTopics = await find('help-topics', {
    tenant: tenant.slug,
    depth: 1,
    limit: 500,
    pagination: false,
    tags: ['help'],
    select: { slug: true, updatedAt: true, faqs: true },
  })

  const dateFallback = new Date().toISOString()

  const defaultSitemap = [
    {
      loc: `${SITE_URL}/search/`,
      lastmod: dateFallback,
    },
    {
      loc: `${SITE_URL}${blogIndexPath}`,
      lastmod: dateFallback,
    },
  ]

  const sitemap = results.docs
    ? results.docs
        .filter((page) => Boolean(page?.slug))
        .map((page) => {
          return {
            loc: `${SITE_URL}${pagePath(page?.slug)}`,
            lastmod: page.updatedAt || dateFallback,
          }
        })
    : []

  const categorySitemap = categories.docs.map((category) => ({
    loc: `${SITE_URL}${blogCategoryPath(category.slug)}`,
    lastmod: category.updatedAt || dateFallback,
  }))

  const helpSitemap = [
    { loc: `${SITE_URL}${helpIndexPath}`, lastmod: dateFallback },
    ...helpTopics.docs.flatMap((topic) => [
      { loc: `${SITE_URL}${helpTopicPath(topic.slug)}`, lastmod: topic.updatedAt || dateFallback },
      ...(topic.faqs ?? [])
        .filter((faq) => typeof faq === 'object' && faq.slug)
        .map((faq) => ({
          loc: `${SITE_URL}${helpQuestionPath(topic.slug, (faq as { slug: string }).slug)}`,
          lastmod: (faq as { updatedAt?: string }).updatedAt || dateFallback,
        })),
    ]),
  ]

  return [...defaultSitemap, ...sitemap, ...categorySitemap, ...helpSitemap]
}

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const sitemap = await getPagesSitemap(tenant)

  return getServerSideSitemap(sitemap)
}
