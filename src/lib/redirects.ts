import config from '@payload-config'
import { getPayload } from 'payload'

import { normalizePath } from '@/routes'

/**
 * Redirect table of each tenant, answered by the proxy (src/proxy.ts) before any page renders.
 *
 * Kept in memory per tenant: refreshed after TTL_MS or right away when the CMS publishes a
 * redirect change (webhook -> invalidateRedirects), and the last known table is kept when the
 * CMS is unreachable. Stored on globalThis so the proxy and the webhook route share it.
 */

const TTL_MS = 60_000

export type RedirectRule = { destination: string; status: 301 | 302 }
type Entry = { rules: Map<string, RedirectRule>; expiresAt: number }

const globalStore = globalThis as typeof globalThis & { __digioRedirects?: Map<string, Entry> }
const store = (globalStore.__digioRedirects ??= new Map<string, Entry>())

export const invalidateRedirects = (tenant?: string) => {
  if (tenant) store.delete(tenant)
  else store.clear()
}

type RedirectDoc = {
  from: string
  type?: string | null
  destinationPath?: string | null
  to?: { type?: string | null; url?: string | null } | null
}

/** Custom URLs keep what the editor typed (their own query, external hosts); references use the resolved path. */
const destinationOf = (doc: RedirectDoc): string | null =>
  doc.to?.type === 'custom' && doc.to.url ? doc.to.url : (doc.destinationPath ?? null)

export const buildRules = (docs: RedirectDoc[]): Map<string, RedirectRule> => {
  const rules = new Map<string, RedirectRule>()
  for (const doc of docs) {
    const destination = destinationOf(doc)
    if (!doc.from || !destination) continue
    rules.set(normalizePath(doc.from), { destination, status: doc.type === '302' ? 302 : 301 })
  }
  return rules
}

type FetchRedirects = (tenant: string) => Promise<RedirectDoc[]>

const fetchRedirects: FetchRedirects = async (tenant) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { and: [{ 'tenant.slug': { equals: tenant } }, { active: { equals: true } }] },
    select: { from: true, type: true, to: true, destinationPath: true },
    depth: 0,
    pagination: false,
    overrideAccess: false,
  })
  return docs as unknown as RedirectDoc[]
}

export async function getRedirectRules(
  tenant: string,
  {
    now = Date.now(),
    fetch: fetchDocs = fetchRedirects,
  }: { now?: number; fetch?: FetchRedirects } = {},
): Promise<Map<string, RedirectRule>> {
  const cached = store.get(tenant)
  if (cached && cached.expiresAt > now) return cached.rules

  try {
    const rules = buildRules(await fetchDocs(tenant))
    store.set(tenant, { rules, expiresAt: now + TTL_MS })
    return rules
  } catch (err) {
    if (cached) {
      console.warn(
        `[redirects] ${(err as Error).message}; serving last known redirects for ${tenant}`,
      )
      return cached.rules
    }
    // No table yet: serve the site without redirects rather than failing every request.
    console.warn(`[redirects] ${(err as Error).message}; no redirects for ${tenant}`)
    return new Map()
  }
}

/**
 * Destination with the request query string preserved (utm_*, gclid, fbclid...). Parameters
 * already in the destination win; the others are appended in their original order.
 */
export const withQuery = (destination: string, search: string): string => {
  const incoming = new URLSearchParams(search)
  if ([...incoming.keys()].length === 0) return destination

  const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(destination) || destination.startsWith('//')
  const url = new URL(destination, 'http://placeholder.local')
  for (const [key, value] of incoming) {
    if (!url.searchParams.has(key)) url.searchParams.append(key, value)
  }

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`
}

/** Redirect for a request path, if any: `{ location, status }`. */
export const matchRedirect = (
  rules: Map<string, RedirectRule>,
  pathname: string,
  search: string,
): { location: string; status: 301 | 302 } | null => {
  const rule = rules.get(normalizePath(pathname))
  return rule ? { location: withQuery(rule.destination, search), status: rule.status } : null
}
