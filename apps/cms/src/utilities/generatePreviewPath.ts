import type { RoutableCollection } from '@digio/routes'
import type { PayloadRequest } from 'payload'

import { routablePath } from '../collections/Redirects/hooks'
import { getTenantSiteURL } from './tenantSite'

type Props = {
  collection: RoutableCollection
  slug: string | null | undefined
  /** Posts: their category (ID or populated), part of the URL. */
  category?: unknown
  tenant: unknown
  req: PayloadRequest
}

/**
 * Builds the preview URL on the document's own website (its tenant's siteUrl). The website
 * validates `previewSecret`, enables Next.js draft mode and redirects to `path`
 * (see apps/web/src/app/(frontend)/next/preview/route.ts).
 */
export const generatePreviewPath = async ({ collection, slug, category, tenant, req }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const path = await routablePath(req, collection, { slug: encodeURIComponent(slug), category })
  // A post without a category has no URL yet.
  if (!path) return null

  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const siteURL = await getTenantSiteURL(req, tenant as Parameters<typeof getTenantSiteURL>[1])

  return `${siteURL}/next/preview/?${encodedParams.toString()}`
}
