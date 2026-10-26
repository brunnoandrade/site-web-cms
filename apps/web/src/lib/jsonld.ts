import type { Faq, Page, Post } from '@digio/payload-types'

import type { Tenant } from '@/lib/cms'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { collapse, lexicalText, seoImage } from '@/utilities/seo'

type Node = Record<string, unknown>

const clean = <T extends Node>(node: T): T =>
  Object.fromEntries(Object.entries(node).filter(([, value]) => value != null && value !== '')) as T

const abs = (tenant: Tenant, path: string) => `${tenant.siteUrl}${path}`

const absoluteUrl = (tenant: Tenant, url: string) =>
  url.startsWith('http') ? url : abs(tenant, url)

const organizationLogo = (tenant: Tenant) => {
  const logo = tenant.app?.organizationLogo
  return logo && typeof logo === 'object' && logo.url
    ? absoluteUrl(tenant, getMediaUrl(logo.url))
    : abs(tenant, '/icons/apple-touch-icon.png')
}

/** Organization and WebSite of the property, on every page. */
export const siteNodes = (tenant: Tenant, searchPath?: string): Node[] => [
  {
    '@graph': [
      {
        '@type': 'Organization',
        '@id': abs(tenant, '/#organization'),
        name: tenant.name,
        url: tenant.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: organizationLogo(tenant),
          width: 180,
          height: 180,
        },
      },
      clean({
        '@type': 'WebSite',
        '@id': abs(tenant, '/#website'),
        url: tenant.siteUrl,
        name: tenant.name,
        inLanguage: 'pt-BR',
        publisher: { '@id': abs(tenant, '/#organization') },
        potentialAction: searchPath
          ? {
              '@type': 'SearchAction',
              target: `${abs(tenant, searchPath)}?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            }
          : undefined,
      }),
    ],
  },
]

/** The property's app (tenant "Aplicativo"), listed on every page. None without a name and a store link. */
export const appNode = (tenant: Tenant): Node | null => {
  const { name, androidUrl, iosUrl } = tenant.app ?? {}
  const urls = [androidUrl, iosUrl].filter((url): url is string => Boolean(url))
  if (!name || urls.length === 0) return null
  return {
    '@type': 'SoftwareApplication',
    name,
    operatingSystem: [androidUrl && 'ANDROID', iosUrl && 'IOS'].filter(Boolean).join(', '),
    applicationCategory: 'FinanceApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    downloadUrl: urls,
  }
}

export const breadcrumbNode = (
  tenant: Tenant,
  items: { name: string; path?: string }[],
  id?: string,
): Node =>
  clean({
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: items.map((item, i) =>
      clean({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item:
          item.path != null
            ? item.path === '/'
              ? tenant.siteUrl
              : abs(tenant, item.path)
            : undefined,
      }),
    ),
  })

export const webPageNode = (
  tenant: Tenant,
  {
    path,
    name,
    description,
    type = 'WebPage',
    extra = {},
  }: {
    path: string
    name: string
    description?: string | null
    type?: 'WebPage' | 'CollectionPage'
    extra?: Node
  },
): Node =>
  clean({
    '@type': type,
    name,
    description,
    url: abs(tenant, path === '/' ? '' : path),
    inLanguage: 'pt-BR',
    ...extra,
  })

type PopulatedFaq = Pick<Faq, 'question' | 'answer'>

/** FAQPage with the questions shown by the page's FAQ blocks (none: no node). */
export const faqPageNode = (layout: Page['layout'] | undefined): Node | null => {
  const faqs: PopulatedFaq[] = []
  for (const block of layout ?? []) {
    if (block.blockType !== 'faq') continue
    for (const faq of block.faqs ?? []) if (typeof faq === 'object') faqs.push(faq)
  }
  if (faqs.length === 0) return null
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: collapse(lexicalText((faq.answer as { root?: unknown })?.root)),
      },
    })),
  }
}

export const qaPageNode = (tenant: Tenant, faq: Faq, path: string): Node => {
  const url = abs(tenant, path)
  const author = { '@type': 'Organization', name: tenant.name, url: tenant.siteUrl }
  const text = collapse(lexicalText((faq.answer as { root?: unknown })?.root))
  return {
    '@type': 'QAPage',
    name: faq.question,
    url,
    mainEntity: {
      '@type': 'Question',
      name: faq.question,
      url,
      answerCount: 1,
      datePublished: faq.createdAt,
      author,
      acceptedAnswer: { '@type': 'Answer', text, datePublished: faq.createdAt, url, author },
    },
  }
}

export const itemListNode = (tenant: Tenant, items: { name: string; path: string }[]): Node => ({
  '@type': 'ItemList',
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: abs(tenant, item.path),
  })),
})

export const blogPostingNode = (
  tenant: Tenant,
  post: Post,
  path: string,
  articleBody: string,
): Node => {
  const url = abs(tenant, path)
  return clean({
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    isPartOf: { '@id': `${url}#webpage` },
    headline: post.title,
    description: post.meta?.description,
    abstract: post.meta?.description,
    articleBody,
    image: absoluteUrl(tenant, seoImage(tenant, post.meta?.image)),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: 'pt-BR',
    publisher: { '@id': abs(tenant, '/#organization') },
  })
}
