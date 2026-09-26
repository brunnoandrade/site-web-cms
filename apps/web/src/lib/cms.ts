import 'server-only'

import type { Config } from '@digio/payload-types'
import type { PaginatedDocs, Where } from 'payload'
import { stringify } from 'qs-esm'

/**
 * Read-only client for the CMS REST API (apps/cms). This is the only place the website talks
 * to the CMS on the server; components never call `fetch` against the CMS directly.
 *
 * Published content is cached by Next.js under cache tags and refreshed by the CMS through
 * the /api/revalidate/ webhook. Draft content (preview) is never cached.
 */

type Collections = Config['collections']
export type CollectionSlug = Exclude<keyof Collections, `payload-${string}`>

type RequestOptions = {
  /** Fetch drafts with the service API key. Use only when Next.js draft mode is enabled. */
  draft?: boolean
  /** Extra cache tags; the collection/global tag is always added. */
  tags?: string[]
}

export type FindArgs = RequestOptions & {
  depth?: number
  limit?: number
  page?: number
  pagination?: boolean
  select?: Record<string, boolean>
  sort?: string
  where?: Where
}

export const getCMSURL = () => process.env.CMS_URL || 'http://localhost:3001'

const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build'

export class CMSRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'CMSRequestError'
  }
}

async function request<T>(
  path: string,
  query: Record<string, unknown>,
  { draft = false, tags = [] }: RequestOptions,
): Promise<T> {
  const search = stringify(
    { ...query, ...(draft ? { draft: true } : {}) },
    { addQueryPrefix: true },
  )
  const headers: Record<string, string> = {}

  if (draft && process.env.CMS_API_KEY) {
    headers.Authorization = `users API-Key ${process.env.CMS_API_KEY}`
  }

  const res = await fetch(`${getCMSURL()}${path}${search}`, {
    headers,
    ...(draft ? { cache: 'no-store' } : { cache: 'force-cache', next: { tags: ['cms', ...tags] } }),
  })

  if (!res.ok) {
    throw new CMSRequestError(`CMS request failed: ${res.status} ${path}`, res.status)
  }

  return (await res.json()) as T
}

/**
 * The website must build without access to the CMS (e.g. inside `docker build`). During
 * `next build` a CMS failure falls back to empty content; those routes are regenerated on
 * the first request or by the revalidation webhook.
 */
async function withBuildFallback<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run()
  } catch (err) {
    if (!isBuildPhase()) throw err
    console.warn(`[cms] ${(err as Error).message}; using empty content during build`)
    return fallback
  }
}

const emptyPage = <T>(): PaginatedDocs<T> => ({
  docs: [],
  hasNextPage: false,
  hasPrevPage: false,
  limit: 0,
  nextPage: null,
  page: 1,
  pagingCounter: 1,
  prevPage: null,
  totalDocs: 0,
  totalPages: 0,
})

/** Collections whose documents belong to a tenant (see the multi-tenant plugin in apps/cms). */
export type TenantCollectionSlug = Exclude<CollectionSlug, 'tenants' | 'users'>

type TenantArgs = {
  /** Tenant slug. Every query is restricted to it and cached under `<tenant>:<tag>` tags. */
  tenant: string
}

const tenantWhere = (tenant: string, where?: Where): Where => {
  const byTenant: Where = { 'tenant.slug': { equals: tenant } }
  return where ? { and: [byTenant, where] } : byTenant
}

export function find<T extends TenantCollectionSlug>(
  collection: T,
  { tenant, draft, tags = [], where, ...query }: FindArgs & TenantArgs,
): Promise<PaginatedDocs<Collections[T]>> {
  return withBuildFallback(
    () =>
      request<PaginatedDocs<Collections[T]>>(
        `/api/${collection}`,
        { ...query, where: tenantWhere(tenant, where) },
        { draft, tags: [collection, ...tags].map((tag) => `${tenant}:${tag}`) },
      ),
    emptyPage<Collections[T]>(),
  )
}

/** Returns the first document of the tenant matching `where`, or null. */
export async function findOne<T extends TenantCollectionSlug>(
  collection: T,
  args: Omit<FindArgs, 'limit' | 'page' | 'pagination'> & TenantArgs,
): Promise<Collections[T] | null> {
  const { docs } = await find(collection, { ...args, limit: 1, pagination: false })
  return docs[0] ?? null
}

export function count(
  collection: TenantCollectionSlug,
  { tenant, where, tags = [] }: Pick<FindArgs, 'where' | 'tags'> & TenantArgs,
): Promise<{ totalDocs: number }> {
  return withBuildFallback(
    () =>
      request(
        `/api/${collection}/count`,
        { where: tenantWhere(tenant, where) },
        { tags: [collection, ...tags].map((tag) => `${tenant}:${tag}`) },
      ),
    { totalDocs: 0 },
  )
}

export type Tenant = Collections['tenants']

/** Tenant by slug, or null. Cached under the `tenants` tag. */
export async function getTenant(slug: string): Promise<Tenant | null> {
  const { docs } = await withBuildFallback(
    () =>
      request<PaginatedDocs<Tenant>>(
        '/api/tenants',
        { where: { slug: { equals: slug } }, limit: 1, depth: 0 },
        { tags: ['tenants'] },
      ),
    emptyPage<Tenant>(),
  )
  return docs[0] ?? null
}
