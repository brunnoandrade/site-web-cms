import type { PayloadRequest } from 'payload'

import { getWebURL } from './getURL'

type TenantRef =
  number | string | { id: number | string; siteUrl?: string | null } | null | undefined

/**
 * Public URL of the tenant's website (tenants.siteUrl), used for previews and SEO URLs.
 * Falls back to WEB_URL when the document has no tenant yet (e.g. a new, unsaved document).
 */
export const getTenantSiteURL = async (req: PayloadRequest, tenant: TenantRef): Promise<string> => {
  if (!tenant) return getWebURL()
  if (typeof tenant === 'object' && tenant.siteUrl) return tenant.siteUrl

  const id = typeof tenant === 'object' ? tenant.id : tenant
  const doc = await req.payload.findByID({
    collection: 'tenants',
    id,
    depth: 0,
    disableErrors: true,
    overrideAccess: true,
    req,
    select: { siteUrl: true },
  })

  return doc?.siteUrl || getWebURL()
}
