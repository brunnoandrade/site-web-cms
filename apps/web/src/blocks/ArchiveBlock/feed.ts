import 'server-only'

export type FeedItem = { title: string; href: string; image: string | null }

/** Revalidation of the external feed (seconds). */
const REVALIDATE = 3600

const decode = (value: string) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .trim()

/** Only Medium feeds: the URL is typed in the admin and fetched by the server. */
const isMediumFeed = (url: URL) =>
  url.protocol === 'https:' &&
  (url.hostname === 'medium.com' || url.hostname.endsWith('.medium.com'))

/**
 * Latest posts of a Medium RSS feed (title, link, first image). Returns an empty list when the feed
 * is not a Medium URL or is unavailable, so the section just disappears instead of breaking the page.
 */
export async function getMediumFeed(
  feedUrl: string | null | undefined,
  limit: number,
): Promise<FeedItem[]> {
  if (!feedUrl) return []
  try {
    const url = new URL(feedUrl)
    if (!isMediumFeed(url)) return []
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return []
    const xml = await response.text()

    const items: FeedItem[] = []
    for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]
      if (!title || !link) continue
      const href = new URL(decode(link))
      href.search = ''
      const image = item.match(/<img[^>]*\ssrc="(https:\/\/[^"]+)"/)?.[1] ?? null
      items.push({ title: decode(title), href: href.toString(), image })
      if (items.length >= limit) break
    }
    return items
  } catch {
    return []
  }
}
