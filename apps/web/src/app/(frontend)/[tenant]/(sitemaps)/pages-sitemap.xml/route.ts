import { getServerSideSitemap } from 'next-sitemap'
import { find } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { categoryPath, isUberHelp, questionPath } from '@/lib/uber-help'
import { pathsOf, styleOf } from '@/lib/urlStyle'

/** Uber Conta help center: the index, one page per category and one per question (flat URLs). */
const getUberHelpSitemap = async (tenant: string, siteUrl: string, fallback: string) => {
  const [categories, faqs] = await Promise.all([
    find('help-categories', { tenant, depth: 0, limit: 100, pagination: false, tags: ['help'] }),
    find('faqs', { tenant, depth: 0, limit: 1000, pagination: false, tags: ['faqs', 'help'] }),
  ])
  return [
    { loc: `${siteUrl}/central-de-ajuda`, lastmod: fallback },
    ...categories.docs.map((c) => ({
      loc: `${siteUrl}${categoryPath(c.slug!)}`,
      lastmod: c.updatedAt || fallback,
    })),
    ...faqs.docs
      .filter((f) => f.slug)
      .map((f) => ({
        loc: `${siteUrl}${questionPath(f.slug!)}`,
        lastmod: f.updatedAt || fallback,
      })),
  ]
}

const getPagesSitemap = async (tenantSlug: string) => {
  const tenant = await requireTenant(tenantSlug)
  const SITE_URL = tenant.siteUrl
  const urls = pathsOf(tenant)

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
      loc: `${SITE_URL}${urls.blogIndex()}`,
      lastmod: dateFallback,
    },
  ]

  const sitemap = results.docs
    ? results.docs
        .filter((page) => Boolean(page?.slug))
        .map((page) => {
          return {
            loc: `${SITE_URL}${urls.page(page?.slug)}`,
            lastmod: page.updatedAt || dateFallback,
          }
        })
    : []

  // A flat blog filters through ?categoria=: those are not separate pages to index.
  const categorySitemap = styleOf(tenant).flatPosts
    ? []
    : categories.docs.map((category) => ({
        loc: `${SITE_URL}${urls.blogCategory(category.slug)}`,
        lastmod: category.updatedAt || dateFallback,
      }))

  const uberHelp = isUberHelp(tenant)
  const uberHelpSitemap = uberHelp
    ? await getUberHelpSitemap(tenant.slug, SITE_URL, dateFallback)
    : []

  const helpSitemap = uberHelp
    ? uberHelpSitemap
    : [
        { loc: `${SITE_URL}${urls.helpIndex()}`, lastmod: dateFallback },
        ...helpTopics.docs.flatMap((topic) => [
          {
            loc: `${SITE_URL}${urls.helpTopic(topic.slug)}`,
            lastmod: topic.updatedAt || dateFallback,
          },
          ...(topic.faqs ?? [])
            .filter((faq) => typeof faq === 'object' && faq.slug)
            .map((faq) => ({
              loc: `${SITE_URL}${urls.helpQuestion(topic.slug, (faq as { slug: string }).slug)}`,
              lastmod: (faq as { updatedAt?: string }).updatedAt || dateFallback,
            })),
        ]),
      ]

  // The same URL must not be listed twice (e.g. the blog index and a CMS page called "blog").
  const seen = new Set<string>()
  return [...defaultSitemap, ...sitemap, ...categorySitemap, ...helpSitemap].filter(({ loc }) => {
    if (seen.has(loc)) return false
    seen.add(loc)
    return true
  })
}

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const sitemap = await getPagesSitemap(tenant)

  return getServerSideSitemap(sitemap)
}
