import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Page } from '@digio/payload-types'

import { revalidateWeb } from '../../../utilities/revalidateWeb'

import { pagePath } from '@digio/routes'

export const revalidatePage: CollectionAfterChangeHook<Page> = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (!req.context.disableRevalidate) {
    const paths: string[] = []

    if (doc._status === 'published') paths.push(pagePath(doc.slug))

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && previousDoc.slug !== doc.slug) {
      paths.push(pagePath(previousDoc.slug))
    } else if (previousDoc?._status === 'published' && doc._status !== 'published') {
      paths.push(pagePath(previousDoc.slug))
    }

    if (paths.length > 0) {
      await revalidateWeb({ req, tenant: doc.tenant, paths, tags: ['pages', 'pages-sitemap'] })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = async ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    await revalidateWeb({
      req,
      tenant: doc?.tenant,
      paths: [pagePath(doc?.slug)],
      tags: ['pages', 'pages-sitemap'],
    })
  }

  return doc
}
