import type { Metadata } from 'next'

import type { Media, Page, Post } from '@digio/payload-types'

import type { Tenant } from '@/lib/cms'
import { getMediaUrl } from './getMediaUrl'

/** Robots directive of every public page (what the current site sends). */
export const SEO_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  'max-image-preview': 'large',
  'max-snippet': -1,
  'max-video-preview': -1,
}

/** Text of a Lexical tree, words separated by one space. */
export const lexicalText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const { text, children } = node as { text?: string; children?: unknown[] }
  return `${text ?? ''} ${Array.isArray(children) ? children.map(lexicalText).join(' ') : ''}`
}

export const collapse = (value: string) => value.replace(/\s+/g, ' ').trim()

/** `<title>` of a page: its title plus the property's suffix (" | Digio", " • Uber Conta"). */
export const seoTitle = (tenant: Tenant, title?: string | null) =>
  title ? `${title}${tenant.seoTitleSuffix || ` | ${tenant.name}`}` : tenant.name

const mediaUrl = (image?: Media | number | null) =>
  image && typeof image === 'object' && 'url' in image && image.url
    ? getMediaUrl(image.sizes?.og?.url || image.url)
    : undefined

/** Share image: the page's own, then the property's default, then the platform's. */
export const seoImage = (tenant: Tenant, image?: Media | number | null) =>
  mediaUrl(image) ?? mediaUrl(tenant.seoDefaultImage) ?? '/website-template-OG.webp'

type Args = {
  tenant: Tenant
  /** Public path with the query that identifies the page (`/blog?page=2`), the canonical URL. */
  path: string
  title?: string | null
  description?: string | null
  keywords?: string | null
  image?: Media | number | null
  /** Open Graph type: "website" (default) or "article". */
  type?: 'website' | 'article'
  publishedTime?: string | null
  modifiedTime?: string | null
  /** Pages that should stay out of search results (results of the site search). */
  noindex?: boolean
}

/**
 * Metadata of a public page: <title> with the property's suffix, og:title and twitter:title
 * without it, the share image, robots and keywords. Relative URLs resolve against the
 * property's metadataBase ([tenant]/layout.tsx).
 */
export const buildMetadata = ({
  tenant,
  path,
  title,
  description,
  keywords,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  noindex,
}: Args): Metadata => {
  const url = `${tenant.siteUrl}${path}`
  const imageUrl = seoImage(tenant, image)
  const shareTitle = title || tenant.name
  return {
    title: seoTitle(tenant, title),
    description: description || undefined,
    keywords: keywords || undefined,
    robots: noindex ? { index: false, follow: true } : SEO_ROBOTS,
    alternates: { canonical: url },
    openGraph: {
      type,
      title: shareTitle,
      description: description || undefined,
      url,
      siteName: tenant.name,
      images: [{ url: imageUrl, alt: tenant.name }],
      ...(type === 'article'
        ? { publishedTime: publishedTime ?? undefined, modifiedTime: modifiedTime ?? undefined }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: description || undefined,
      images: [imageUrl],
    },
  }
}

export type MetaDoc = Pick<Page | Post, 'meta'>
