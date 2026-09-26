import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '@digio/payload-types'

import type { Tenant } from '@/lib/cms'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getMediaUrl } from './getMediaUrl'

// Relative URLs are resolved against the tenant's metadataBase ([tenant]/layout.tsx).
const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url
    return getMediaUrl(ogUrl || image.url)
  }

  return '/website-template-OG.webp'
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  tenant: Tenant
  /** Public path of the document, with trailing slash (e.g. "/blog/noticias/foo/"). */
  path: string
}): Promise<Metadata> => {
  const { doc, tenant, path } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? `${doc.meta.title} | ${tenant.name}` : tenant.name

  return {
    description: doc?.meta?.description,
    alternates: {
      canonical: `${tenant.siteUrl}${path}`,
    },
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: [{ url: ogImage }],
      siteName: tenant.name,
      title,
      url: `${tenant.siteUrl}${path}`,
    }),
    title,
  }
}
