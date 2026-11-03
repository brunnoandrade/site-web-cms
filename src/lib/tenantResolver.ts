/**
 * Resolves the request host to a tenant slug (tenants.domains in the CMS).
 *
 * Read through the Payload Local API. Results are kept in memory: refreshed after `TTL_MS`, and the last known value is kept when
 * the database is unreachable, so the website keeps serving its properties if the CMS is down.
 */

import config from '@payload-config'
import { getPayload } from 'payload'

import { urlStyleOf, type UrlStyle } from '@/routes'

const TTL_MS = 60_000

/** A tenant as the proxy needs it: its slug and its URL policy (trailing slash, blog URLs). */
export type TenantInfo = { slug: string; style: UrlStyle }

type Entry = { tenant: TenantInfo | null; expiresAt: number }

const cache = new Map<string, Entry>()

/** "WWW.Digio.com.br:443" -> "www.digio.com.br" */
export const normalizeHost = (host: string): string =>
  host.trim().toLowerCase().split(',')[0]!.trim().replace(/:\d+$/, '')

type FetchTenant = (host: string) => Promise<TenantInfo | string | null>

const fetchTenantSlug: FetchTenant = async (host) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tenants',
    where: { 'domains.domain': { equals: host } },
    select: { slug: true, trailingSlash: true, blogUrlStyle: true },
    depth: 0,
    limit: 1,
    overrideAccess: false,
  })
  const doc = docs[0]
  return doc ? { slug: doc.slug, style: urlStyleOf(doc) } : null
}

const toInfo = (value: TenantInfo | string | null): TenantInfo | null =>
  typeof value === 'string' ? { slug: value, style: urlStyleOf(null) } : value

type ResolveOptions = { now?: number; fetchTenant?: FetchTenant }

export async function resolveTenant(
  rawHost: string,
  { now = Date.now(), fetchTenant = fetchTenantSlug }: ResolveOptions = {},
): Promise<TenantInfo | null> {
  const host = normalizeHost(rawHost)
  const cached = cache.get(host)

  if (cached && cached.expiresAt > now) return cached.tenant

  try {
    const tenant = toInfo(await fetchTenant(host))
    cache.set(host, { tenant, expiresAt: now + TTL_MS })
    return tenant
  } catch (err) {
    if (cached) {
      console.warn(`[tenant] ${(err as Error).message}; serving last known tenant for ${host}`)
      return cached.tenant
    }
    throw err
  }
}

export async function resolveTenantSlug(
  rawHost: string,
  options: ResolveOptions = {},
): Promise<string | null> {
  return (await resolveTenant(rawHost, options))?.slug ?? null
}

/** For tests. */
export const clearTenantCache = () => cache.clear()
