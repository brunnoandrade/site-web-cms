import type { Metadata } from 'next'

import type { Page, Post } from '@/payload-types'

import type { Tenant } from '@/lib/cms'
import { buildMetadata, documentSeo } from './seo'

/** Metadata of a page or post from its SEO fields (see buildMetadata). */
export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  tenant: Tenant
  /** Public path of the document (e.g. "/blog/noticias/foo/"). */
  path: string
  type?: 'website' | 'article'
}): Promise<Metadata> => {
  const { doc, tenant, path, type } = args
  const seo = documentSeo(doc)
  return buildMetadata({
    tenant,
    path,
    type,
    title: seo.title,
    description: seo.description,
    keywords: doc?.meta?.keywords,
    image: seo.image,
    publishedTime: (doc as Partial<Post> | null)?.publishedAt,
    modifiedTime: doc?.updatedAt,
  })
}
