import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type PaginatedDocs, type Where } from 'payload'

import type { Config } from '@/payload-types'

/**
 * Read-only access to the CMS content through the Payload Local API (same process, no HTTP). This is the
 * only place the website reads the CMS on the server; components never talk to Payload directly.
 *
 * Published content is cached by Next.js under cache tags and refreshed by the CMS through the
 * /api/revalidate/ webhook. Draft content (preview) is never cached.
 *
 * Reads run as an anonymous visitor (`overrideAccess: false`), exactly like the public REST API did. Drafts
 * are the exception: they are only requested while Next.js draft mode is on, which the preview route grants
 * after checking a signed token.
 */

type Collections = Config['collections']
export type CollectionSlug = Exclude<keyof Collections, `payload-${string}`>

type RequestOptions = {
  /** Read drafts. Use only when Next.js draft mode is enabled. */
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


const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build'

/**
 * The website must build without access to the CMS (e.g. inside `docker build`, where there is no database).
 * During `next build` a database failure falls back to empty content; those routes are regenerated on the
 * first request or by the revalidation webhook.
 */
async function withBuildFallback<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  if (isBuildPhase() && !process.env.DATABASE_URL) return fallback

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

/**
 * Runs `read` against the Local API. Published reads go through the Next.js data cache under `tags`; the
 * result is serialized as JSON, so it has the same shape the REST API returned (dates as strings).
 */
function cached<T>(
  keyParts: unknown[],
  tags: string[],
  draft: boolean | undefined,
  read: () => Promise<T>,
): Promise<T> {
  if (draft) return read()
  return unstable_cache(read, ['cms', ...keyParts.map((part) => JSON.stringify(part))], {
    tags: ['cms', ...tags],
  })()
}

/** Collections whose documents belong to a tenant (see the multi-tenant plugin). */
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
  const finalWhere = tenantWhere(tenant, where)

  return withBuildFallback(
    async () =>
      cached(
        [collection, query, finalWhere],
        [collection, ...tags].map((tag) => `${tenant}:${tag}`),
        draft,
        async () => {
          const payload = await getPayload({ config })
          return (await payload.find({
            collection,
            ...query,
            where: finalWhere,
            draft: Boolean(draft),
            overrideAccess: Boolean(draft),
          })) as unknown as PaginatedDocs<Collections[T]>
        },
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
  const finalWhere = tenantWhere(tenant, where)

  return withBuildFallback(
    () =>
      cached(
        ['count', collection, finalWhere],
        [collection, ...tags].map((tag) => `${tenant}:${tag}`),
        false,
        async () => {
          const payload = await getPayload({ config })
          const { totalDocs } = await payload.count({
            collection,
            where: finalWhere,
            overrideAccess: false,
          })
          return { totalDocs }
        },
      ),
    { totalDocs: 0 },
  )
}

export type Tenant = Collections['tenants']

/** Tenant by slug, or null. Cached under the `tenants` tag. */
export async function getTenant(slug: string): Promise<Tenant | null> {
  const { docs } = await withBuildFallback(
    () =>
      cached(['tenants', slug], ['tenants'], false, async () => {
        const payload = await getPayload({ config })
        return (await payload.find({
          collection: 'tenants',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 1,
          overrideAccess: false,
        })) as unknown as PaginatedDocs<Tenant>
      }),
    emptyPage<Tenant>(),
  )
  return docs[0] ?? null
}
