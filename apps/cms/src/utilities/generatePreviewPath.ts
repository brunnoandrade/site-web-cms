import type { RoutableCollection } from '@digio/routes'
import { createPreviewToken } from '@digio/routes/preview-token'
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
 * validates `previewToken` (signed, short-lived, bound to the site host and path), enables Next.js draft mode and redirects to `path`
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

  const siteURL = await getTenantSiteURL(req, tenant as Parameters<typeof getTenantSiteURL>[1])

  // The URL is visible to every editor, so it carries a token for this host and path only,
  // never the shared PREVIEW_SECRET itself.
  const secret = process.env.PREVIEW_SECRET
  if (!secret) return null

  const encodedParams = new URLSearchParams({
    path,
    previewToken: createPreviewToken(secret, { host: new URL(siteURL).host, path }),
  })

  return `${siteURL}/next/preview/?${encodedParams.toString()}`
}
