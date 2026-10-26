import type { Metadata } from 'next'

import type { Page, Post } from '@digio/payload-types'

import type { Tenant } from '@/lib/cms'
import { buildMetadata } from './seo'

/** Metadata of a page or post from its SEO fields (see buildMetadata). */
export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  tenant: Tenant
  /** Public path of the document (e.g. "/blog/noticias/foo/"). */
  path: string
  type?: 'website' | 'article'
}): Promise<Metadata> => {
  const { doc, tenant, path, type } = args
  return buildMetadata({
    tenant,
    path,
    type,
    title: doc?.meta?.title,
    description: doc?.meta?.description,
    keywords: doc?.meta?.keywords,
    image: doc?.meta?.image,
    publishedTime: (doc as Partial<Post> | null)?.publishedAt,
    modifiedTime: doc?.updatedAt,
  })
}
