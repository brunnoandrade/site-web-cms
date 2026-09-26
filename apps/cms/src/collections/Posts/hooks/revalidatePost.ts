import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Post } from '@digio/payload-types'

import { revalidateWeb } from '../../../utilities/revalidateWeb'
import { routablePath } from '../../Redirects/hooks'

// Blog listings (/blog/, category pages, archive blocks, related posts) use the 'posts' tag.
const tags = ['posts', 'posts-sitemap']

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (!req.context.disableRevalidate) {
    const paths = new Set<string>()
    const current = await routablePath(req, 'posts', doc)
    const previous =
      previousDoc?._status === 'published' ? await routablePath(req, 'posts', previousDoc) : null

    if (doc._status === 'published' && current) paths.add(current)
    // The previous URL, when the post moved (slug or category) or was unpublished.
    if (previous && (previous !== current || doc._status !== 'published')) paths.add(previous)

    if (paths.size > 0) {
      await revalidateWeb({ req, tenant: doc.tenant, paths: [...paths], tags })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = async ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    const path = doc ? await routablePath(req, 'posts', doc) : null
    await revalidateWeb({ req, tenant: doc?.tenant, paths: path ? [path] : [], tags })
  }

  return doc
}
