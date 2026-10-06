/**
 * Public URLs of the website. Used by the CMS (automatic redirects, preview, SEO) and by the
 * website (links), so both always agree on where a document lives.
 *
 * Every page URL ends with "/" (the current site's URLs do, see trailingSlash in apps/web).
 */

export type RoutableCollection = 'pages' | 'posts'

/** A category reference as it comes from the API: populated object, ID, or missing. */
type CategoryRef = { slug?: string | null } | number | string | null | undefined

export type RoutableDoc = { slug?: string | null; category?: CategoryRef }

export const HOME_SLUG = 'home'

export const pagePath = (slug?: string | null): string =>
  !slug || slug === HOME_SLUG ? '/' : `/${slug}/`

// Blog: same structure as the current WordPress (/blog/<categoria>/<slug>/), so migrated posts
// keep their URLs.
export const blogIndexPath = '/blog/'

export const blogCategoryPath = (categorySlug: string): string => `${blogIndexPath}${categorySlug}/`

export const blogPagePath = (pageNumber: number, categorySlug?: string): string =>
  `${categorySlug ? blogCategoryPath(categorySlug) : blogIndexPath}page/${pageNumber}/`

export const postPath = (categorySlug: string, slug: string): string =>
  `${blogCategoryPath(categorySlug)}${slug}/`

// Help center: same structure as the current site (/central-de-ajuda/<topico>/<pergunta>/).
export const helpIndexPath = '/central-de-ajuda/'

export const helpTopicPath = (topicSlug: string): string => `${helpIndexPath}${topicSlug}/`

export const helpQuestionPath = (topicSlug: string, questionSlug: string): string =>
  `${helpTopicPath(topicSlug)}${questionSlug}/`

/** Parses a help center URL: "/central-de-ajuda/pix/" or "/central-de-ajuda/pix/como-usar/". */
export const parseHelpPath = (
  path: string,
): { topicSlug: string; questionSlug?: string } | null => {
  const match = /^\/central-de-ajuda\/([^/]+)\/(?:([^/]+)\/)?$/.exec(path)
  if (!match) return null
  return { topicSlug: match[1]!, ...(match[2] ? { questionSlug: match[2] } : {}) }
}

/** Slug of a populated category; null when it is only an ID or missing. */
export const categorySlugOf = (category: CategoryRef): string | null =>
  category && typeof category === 'object' && category.slug ? category.slug : null

/**
 * Public URL of a page or post. Posts need their category populated (depth >= 1); without it
 * there is no URL and this returns null.
 */
export const documentPath = (collection: RoutableCollection, doc: RoutableDoc): string | null => {
  if (collection === 'pages') return pagePath(doc.slug)
  const categorySlug = categorySlugOf(doc.category)
  return categorySlug && doc.slug ? postPath(categorySlug, doc.slug) : null
}

/** Parses a blog post URL: "/blog/noticias/meu-post/" -> { categorySlug, slug }. */
export const parsePostPath = (path: string): { categorySlug: string; slug: string } | null => {
  const match = /^\/blog\/([^/]+)\/([^/]+)\/$/.exec(path)
  if (!match || match[1] === 'page') return null
  return { categorySlug: match[1]!, slug: match[2]! }
}

/**
 * URL slug from a Portuguese title: transliterates accents instead of dropping them
 * ("O cartão tem anuidade?" -> "o-cartao-tem-anuidade", as on the current site).
 */
export const toSlug = (value: unknown): string =>
  typeof value !== 'string'
    ? ''
    : value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, ' e ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

/** Last path segment has a file extension (e.g. /sitemap.xml, /img/a.png). */
export const isFilePath = (pathname: string): boolean => /\/[^/]+\.[a-z0-9]+$/i.test(pathname)

/**
 * Canonical form of a site path, used to store and match redirect sources:
 * - accepts a full URL or a path ("https://www.digio.com.br/Foo?x=1" -> "/Foo/");
 * - drops query string and fragment;
 * - collapses repeated slashes, adds the leading slash;
 * - adds the trailing slash, except for file paths;
 * - decodes percent-encoding, so "/cart%C3%A3o/" and "/cartão/" are the same source.
 * Case is kept: paths are case-sensitive.
 */
export const normalizePath = (input: string): string => {
  let value = input.trim()

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    value = new URL(value).pathname
  }

  value = value.replace(/[?#].*$/, '')

  try {
    value = decodeURI(value)
  } catch {
    // keep malformed sequences as they are
  }

  value = `/${value}`.replace(/\/{2,}/g, '/')

  if (!value.endsWith('/') && !isFilePath(value)) value = `${value}/`

  return value
}

export { hrefValidationMessage, isSafeHref } from './safeHref'
