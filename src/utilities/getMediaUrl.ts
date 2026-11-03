/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 *
 * Local paths (e.g. `/api/media/file/image.webp`) are kept relative so
 * Next.js image optimization treats them as local rather than fetching
 * through `remotePatterns`, which blocks private IPs since Next.js 16.
 *
 * With `trailingSlash: true`, Payload also appends '/' to generated file URLs
 * (e.g. `/api/media/file/image.webp/`). File paths must not end with '/', otherwise
 * Next.js redirects them and next/image rejects the source, so it is stripped here.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  url = stripFileTrailingSlash(url)

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  return cacheTag ? `${url}?${cacheTag}` : url
}

// Removes the trailing slash only when the last path segment looks like a file (has an extension).
const stripFileTrailingSlash = (url: string): string => {
  const queryIndex = url.search(/[?#]/)
  const path = queryIndex === -1 ? url : url.slice(0, queryIndex)
  const rest = queryIndex === -1 ? '' : url.slice(queryIndex)

  return /\.[a-z0-9]+\/$/i.test(path) ? `${path.slice(0, -1)}${rest}` : url
}
