import { JSDOM } from 'jsdom'

export type SeoHead = {
  title: string | null
  description: string | null
  image: string | null
  canonical: string | null
}

/** Suffix the current blog adds to every title ("Post | Blog do Digio"). */
export const TITLE_SUFFIX = /\s*[|–-]\s*Blog do Digio\s*$/i

/**
 * SEO of a published post, read from its HTML head: the WordPress REST API does not expose it
 * (no Yoast fields), but the page has <title>, meta description and og:image.
 */
export function parseSeoHead(html: string): SeoHead {
  const { document } = new JSDOM(html).window
  const meta = (selector: string) =>
    document.querySelector<HTMLMetaElement>(selector)?.content?.trim() || null

  const rawTitle =
    meta('meta[property="og:title"]') ??
    document.querySelector('title')?.textContent?.trim() ??
    null

  return {
    title: rawTitle ? rawTitle.replace(TITLE_SUFFIX, '') : null,
    description: meta('meta[name="description"]') ?? meta('meta[property="og:description"]'),
    image: meta('meta[property="og:image"]'),
    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
  }
}

/** Decodes HTML entities from WordPress titles ("Caf&#233; &amp; cr&eacute;dito"). */
export const decodeEntities = (value: string): string =>
  new JSDOM(`<!doctype html><p>${value}</p>`).window.document.querySelector('p')!.textContent ??
  value
