import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateWeb } from '../utilities/revalidateWeb'

/**
 * For content embedded in pages through blocks (products, rates, FAQs, banners): any change
 * refreshes the tenant's cached pages, plus the given extra tags.
 */
export const revalidateTenantContent = (
  tags: string[],
): { afterChange: CollectionAfterChangeHook; afterDelete: CollectionAfterDeleteHook } => ({
  afterChange: async ({ doc, req }) => {
    if (!req.context.disableRevalidate) {
      await revalidateWeb({ req, tenant: doc.tenant, tags: ['pages', ...tags] })
    }
    return doc
  },
  afterDelete: async ({ doc, req }) => {
    if (!req.context.disableRevalidate) {
      await revalidateWeb({ req, tenant: doc?.tenant, tags: ['pages', ...tags] })
    }
    return doc
  },
})
