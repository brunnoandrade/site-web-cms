import type { ISitemapField } from 'next-sitemap'

import type { Tenant } from '@/lib/cms'
import type { Media, Post } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/** Sitemap index of a property: one entry per sitemap, each with the date of its latest change. */
export const sitemapIndexXml = (
  tenant: Pick<Tenant, 'siteUrl'>,
  entries: { path: string; lastmod: string }[],
): string => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    ({ path, lastmod }) =>
      `  <sitemap><loc>${tenant.siteUrl}${path}</loc><lastmod>${lastmod}</lastmod></sitemap>`,
  )
  .join('\n')}
</sitemapindex>
`

/** The most recent of the given ISO dates; `fallback` when there is none. */
export const latestDate = (dates: (string | null | undefined)[], fallback: string): string =>
  dates
    .filter((date): date is string => Boolean(date))
    .reduce((latest, date) => (date > latest ? date : latest), '') || fallback

/** Absolute URL of an image of the CMS (`/media/...` paths are relative to the property). */
const absoluteImage = (tenant: Pick<Tenant, 'siteUrl'>, image?: Media | number | null) => {
  if (!image || typeof image !== 'object' || !image.url) return undefined
  const url = getMediaUrl(image.url)
  return url.startsWith('http') ? url : `${tenant.siteUrl}${url}`
}

/**
 * Entry of a post in posts-sitemap.xml, with its image (Google image sitemap): the hero image,
 * else the share image. Posts without an image have no `images`.
 */
export const postSitemapEntry = (
  tenant: Pick<Tenant, 'siteUrl'>,
  post: Pick<Post, 'heroImage' | 'meta' | 'updatedAt' | 'title'>,
  path: string,
  fallbackDate: string,
): ISitemapField => {
  const image = absoluteImage(tenant, post.heroImage) ?? absoluteImage(tenant, post.meta?.image)
  return {
    loc: `${tenant.siteUrl}${path}`,
    lastmod: post.updatedAt || fallbackDate,
    ...(image ? { images: [{ loc: new URL(image), title: post.title }] } : {}),
  }
}
