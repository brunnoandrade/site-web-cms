/**
 * Public URLs of the website. Used by the CMS (automatic redirects, preview, SEO) and by the
 * website (links), so both always agree on where a document lives.
 *
 * By default every page URL ends with "/" and blog posts live under their category (WordPress
 * structure). A property can choose another policy with a `UrlStyle` (tenant fields
 * `trailingSlash` and `blogUrlStyle`), so a cutover keeps the URLs of the site being replaced:
 * see `paths(style)`.
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

// ---- URL policy per property ---------------------------------------------------------------

/** How a property writes its URLs. The defaults are the Digio ones. */
export type UrlStyle = {
  /** "/pix/" (true, default) or "/pix" (false). The other form redirects. */
  trailingSlash?: boolean
  /** Posts at "/blog/<post>", category filter in "?categoria=", pages in "?page=". */
  flatPosts?: boolean
}

type TenantUrlFields = {
  trailingSlash?: boolean | null
  blogUrlStyle?: string | null
} | null | undefined

/** The URL policy stored in a tenant document. */
export const urlStyleOf = (tenant: TenantUrlFields): UrlStyle => ({
  trailingSlash: tenant?.trailingSlash !== false,
  flatPosts: tenant?.blogUrlStyle === 'flat',
})

/**
 * Writes a path in the property's form: trailing slash added or removed (the root, file paths
 * and the query string are left alone). Accepts a path with a query string.
 */
export const withStyle = (path: string, style: UrlStyle = {}): string => {
  // Full URLs (https:, mailto:, //host) are not ours to rewrite.
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path
  const [pathname = '', ...rest] = path.split('?')
  const query = rest.length ? `?${rest.join('?')}` : ''
  if (pathname === '' || pathname === '/' || isFilePath(pathname) || pathname.startsWith('#')) {
    return path
  }
  const trimmed = pathname.replace(/\/+$/, '')
  return `${style.trailingSlash === false ? trimmed : `${trimmed}/`}${query}`
}

/** Every public URL of a property, in its own form. */
export const paths = (style: UrlStyle = {}) => {
  const s = (path: string) => withStyle(path, style)
  const flat = style.flatPosts === true
  const blogQuery = (pageNumber?: number, categorySlug?: string) => {
    const params = new URLSearchParams()
    if (categorySlug) params.set('categoria', categorySlug)
    if (pageNumber && pageNumber > 1) params.set('page', String(pageNumber))
    const query = params.toString()
    return query ? `/blog?${query}` : '/blog'
  }
  const post = (categorySlug: string, slug: string) =>
    flat ? s(`/blog/${slug}`) : s(postPath(categorySlug, slug))

  return {
    page: (slug?: string | null) => s(pagePath(slug)),
    blogIndex: () => s(blogIndexPath),
    blogCategory: (categorySlug: string) =>
      flat ? blogQuery(1, categorySlug) : s(blogCategoryPath(categorySlug)),
    blogPage: (pageNumber: number, categorySlug?: string) =>
      flat ? blogQuery(pageNumber, categorySlug) : s(blogPagePath(pageNumber, categorySlug)),
    post,
    helpIndex: () => s(helpIndexPath),
    helpTopic: (topicSlug: string) => s(helpTopicPath(topicSlug)),
    helpQuestion: (topicSlug: string, questionSlug: string) =>
      s(helpQuestionPath(topicSlug, questionSlug)),
    /** Public URL of a page or post; posts need their category populated (null without it). */
    document: (collection: RoutableCollection, doc: RoutableDoc): string | null => {
      if (collection === 'pages') return s(pagePath(doc.slug))
      const categorySlug = categorySlugOf(doc.category)
      return categorySlug && doc.slug ? post(categorySlug, doc.slug) : null
    },
  }
}
