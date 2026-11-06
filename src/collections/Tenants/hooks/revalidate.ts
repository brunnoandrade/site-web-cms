import type { CollectionAfterChangeHook } from 'payload'

import { revalidateAllWeb } from '@/utilities/revalidateWeb'

/** Property settings are read by every page (layout), so the site cache is dropped on save. */
export const revalidateSite: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc
  await revalidateAllWeb()
  return doc
}
