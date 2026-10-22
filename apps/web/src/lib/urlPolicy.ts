import { isFilePath, withStyle, type UrlStyle } from '@digio/routes'

/**
 * URL policy of a property, applied by the proxy (src/proxy.ts) to every page request:
 * - the other form of the trailing slash redirects to the canonical one;
 * - with flat blog posts, the WordPress-style blog URLs ("/blog/<categoria>/<post>/",
 *   "/blog/page/2/", "/blog/<categoria>/page/2/") redirect to the flat ones.
 * Pages are always rendered by the internal routes with a trailing slash (`internalPath`).
 */

export type PolicyRedirect = { location: string; status: 301 | 308 }

const keepQuery = (location: string, search: string) => {
  if (!search) return location
  const [path, query = ''] = location.split('?')
  const merged = new URLSearchParams(query)
  for (const [key, value] of new URLSearchParams(search)) {
    if (!merged.has(key)) merged.append(key, value)
  }
  const joined = merged.toString()
  return joined ? `${path}?${joined}` : path!
}

export const policyRedirect = (
  pathname: string,
  search: string,
  style: UrlStyle,
): PolicyRedirect | null => {
  const segments = pathname.split('/').filter(Boolean)

  if (style.flatPosts && segments[0] === 'blog') {
    // /blog/page/2/ -> /blog?page=2
    if (segments.length === 3 && segments[1] === 'page' && /^\d+$/.test(segments[2]!)) {
      return { location: keepQuery(`/blog?page=${segments[2]}`, search), status: 301 }
    }
    // /blog/<categoria>/page/2/ -> /blog?categoria=<categoria>&page=2
    if (segments.length === 4 && segments[2] === 'page' && /^\d+$/.test(segments[3]!)) {
      const query = `categoria=${segments[1]}&page=${segments[3]}`
      return { location: keepQuery(`/blog?${query}`, search), status: 301 }
    }
    // /blog/<categoria>/<post>/ -> /blog/<post>
    if (segments.length === 3 && segments[1] !== 'page') {
      return { location: keepQuery(`/blog/${segments[2]}`, search), status: 301 }
    }
  }

  if (pathname !== '/' && !isFilePath(pathname)) {
    const hasSlash = pathname.endsWith('/')
    if (style.trailingSlash === false && hasSlash) {
      return { location: `${pathname.replace(/\/+$/, '')}${search}`, status: 301 }
    }
    if (style.trailingSlash !== false && !hasSlash) {
      return { location: `${pathname}/${search}`, status: 308 }
    }
  }

  return null
}

/** The path the internal routes expect (always with a trailing slash, files excepted). */
export const internalPath = (pathname: string): string =>
  pathname === '/' || pathname.endsWith('/') || isFilePath(pathname) ? pathname : `${pathname}/`

/** A redirect destination written in the property's form (relative destinations only). */
export const styledDestination = (location: string, style: UrlStyle): string =>
  location.startsWith('/') && !location.startsWith('//') ? withStyle(location, style) : location
