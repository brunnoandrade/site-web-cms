import type { PayloadRequest } from 'payload'

import { getWebInternalURL } from './getURL'

type TenantRef = number | string | { id: number | string; slug?: string | null } | null | undefined

type Args = {
  req: PayloadRequest
  /** Tenant of the changed document: paths and tags are scoped to it. */
  tenant: TenantRef
  /** Public paths, as the visitor sees them (e.g. "/contato/"). */
  paths?: string[]
  /** Tags without the tenant prefix (e.g. "pages"). */
  tags?: string[]
}

export const getTenantSlug = async (
  req: PayloadRequest,
  tenant: TenantRef,
): Promise<string | null> => {
  if (!tenant) return null
  if (typeof tenant === 'object' && tenant.slug) return tenant.slug

  const id = typeof tenant === 'object' ? tenant.id : tenant
  const doc = await req.payload.findByID({
    collection: 'tenants',
    id,
    depth: 0,
    overrideAccess: true,
    req,
    select: { slug: true },
  })

  return doc?.slug ?? null
}

/**
 * Asks the website (apps/web) to revalidate cached paths and tags via its webhook.
 * The website serves each tenant under an internal `/<tenant-slug>/...` route and tags its
 * cache as `<tenant-slug>:<tag>`, so both are scoped here.
 * Never throws: a website outage must not block editors from saving content.
 */
export const revalidateWeb = async ({
  req,
  tenant,
  paths = [],
  tags = [],
}: Args): Promise<void> => {
  const { payload } = req
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    payload.logger.warn('REVALIDATE_SECRET is not set; skipping website revalidation')
    return
  }

  try {
    const tenantSlug = await getTenantSlug(req, tenant)

    if (!tenantSlug) {
      payload.logger.warn('Document has no tenant; skipping website revalidation')
      return
    }

    const body = {
      paths: paths.map((path) => `/${tenantSlug}${path}`),
      tags: tags.map((tag) => `${tenantSlug}:${tag}`),
    }

    const res = await fetch(`${getWebInternalURL()}/api/revalidate/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      payload.logger.error(`Website revalidation failed with status ${res.status}`)
      return
    }

    payload.logger.info(`Revalidated website: ${[...body.paths, ...body.tags].join(', ')}`)
  } catch (err) {
    payload.logger.error({ err }, 'Website revalidation request failed')
  }
}

/**
 * Drops every cached CMS response on the website (the `cms` tag, see apps/web/src/lib/cms.ts).
 * For bulk operations such as the seed, which skip the per-document revalidation.
 */
export const revalidateAllWeb = async (): Promise<boolean> => {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return false

  try {
    const res = await fetch(`${getWebInternalURL()}/api/revalidate/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: ['cms', 'tenants'] }),
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}
