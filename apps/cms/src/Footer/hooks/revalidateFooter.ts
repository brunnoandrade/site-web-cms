import type { CollectionAfterChangeHook } from 'payload'

import { revalidateWeb } from '../../utilities/revalidateWeb'

export const revalidateFooter: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    await revalidateWeb({ req, tenant: doc.tenant, tags: ['footer'] })
  }

  return doc
}
