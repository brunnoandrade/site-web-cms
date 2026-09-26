/**
 * Resolves the request host to a tenant slug (tenants.domains in the CMS).
 *
 * Results are kept in memory: refreshed after `TTL_MS`, and the last known value is kept when
 * the CMS is unreachable, so the website keeps serving its properties if the CMS is down.
 */

const TTL_MS = 60_000

type Entry = { slug: string | null; expiresAt: number }

const cache = new Map<string, Entry>()

/** "WWW.Digio.com.br:443" -> "www.digio.com.br" */
export const normalizeHost = (host: string): string =>
  host.trim().toLowerCase().split(',')[0]!.trim().replace(/:\d+$/, '')

type FetchTenant = (host: string) => Promise<string | null>

const fetchTenantSlug: FetchTenant = async (host) => {
  const cmsURL = process.env.CMS_URL || 'http://localhost:3001'
  const query = new URLSearchParams({
    'where[domains.domain][equals]': host,
    'select[slug]': 'true',
    depth: '0',
    limit: '1',
  })

  const res = await fetch(`${cmsURL}/api/tenants?${query}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Tenant lookup failed: ${res.status}`)

  const { docs } = (await res.json()) as { docs: { slug: string }[] }
  return docs[0]?.slug ?? null
}

export async function resolveTenantSlug(
  rawHost: string,
  {
    now = Date.now(),
    fetchTenant = fetchTenantSlug,
  }: { now?: number; fetchTenant?: FetchTenant } = {},
): Promise<string | null> {
  const host = normalizeHost(rawHost)
  const cached = cache.get(host)

  if (cached && cached.expiresAt > now) return cached.slug

  try {
    const slug = await fetchTenant(host)
    cache.set(host, { slug, expiresAt: now + TTL_MS })
    return slug
  } catch (err) {
    if (cached) {
      console.warn(`[tenant] ${(err as Error).message}; serving last known tenant for ${host}`)
      return cached.slug
    }
    throw err
  }
}

/** For tests. */
export const clearTenantCache = () => cache.clear()
