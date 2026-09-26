import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateWeb } from '../utilities/revalidateWeb'

export const revalidateRedirects: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateWeb({ req, tenant: doc.tenant, tags: ['redirects'] })

  return doc
}

export const revalidateRedirectsDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateWeb({ req, tenant: doc?.tenant, tags: ['redirects'] })

  return doc
}
