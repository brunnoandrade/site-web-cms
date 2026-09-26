import type { CollectionAfterChangeHook } from 'payload'

import { revalidateWeb } from '../../utilities/revalidateWeb'

export const revalidateHeader: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    await revalidateWeb({ req, tenant: doc.tenant, tags: ['header'] })
  }

  return doc
}
