import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  PayloadRequest,
} from 'payload'
import { ValidationError } from 'payload'
import {
  blogCategoryPath,
  categorySlugOf,
  documentPath,
  normalizePath,
  parseHelpPath,
  parsePostPath,
  postPath,
  type RoutableCollection,
} from '@digio/routes'

import type { Redirect } from '@digio/payload-types'

import { checkRedirect, customDestinationPath, type RedirectSummary } from './rules'

// Postgres IDs are numbers.
type TenantID = number
type To = NonNullable<Redirect['to']>

const relationID = (value: unknown): TenantID | null => {
  const id =
    value && typeof value === 'object' && 'id' in value ? (value as { id: unknown }).id : value
  const number = typeof id === 'string' ? Number(id) : id
  return typeof number === 'number' && Number.isFinite(number) ? number : null
}

export const tenantDomains = async (req: PayloadRequest, tenant: TenantID): Promise<string[]> => {
  const doc = await req.payload.findByID({
    collection: 'tenants',
    id: tenant,
    depth: 0,
    overrideAccess: true,
    req,
    select: { domains: true },
  })
  return (doc?.domains ?? []).map((row) => row.domain.toLowerCase())
}

/** Normalized destination path on the same site, or null when external or unresolvable. */
export const resolveDestinationPath = async (
  req: PayloadRequest,
  tenant: TenantID,
  to: To | null | undefined,
): Promise<string | null> => {
  if (!to) return null

  if (to.type === 'reference' && to.reference) {
    const relationTo = to.reference.relationTo as RoutableCollection
    const id = relationID(to.reference.value)
    if (id === null) return null
    const doc = await req.payload.findByID({
      collection: relationTo,
      id,
      depth: 1,
      disableErrors: true,
      overrideAccess: true,
      req,
    })
    return doc ? documentPath(relationTo, doc) : null
  }

  return to.url ? customDestinationPath(to.url, await tenantDomains(req, tenant)) : null
}

/**
 * Public URL of a page or post. A post needs its category slug; when the category is only an
 * ID (hooks receive depth 0 documents) it is loaded.
 */
export const routablePath = async (
  req: PayloadRequest,
  collection: RoutableCollection,
  doc: { slug?: string | null; category?: unknown },
): Promise<string | null> => {
  if (collection === 'pages' || categorySlugOf(doc.category as never)) {
    return documentPath(collection, doc as never)
  }
  const categoryID = relationID(doc.category)
  if (categoryID === null || !doc.slug) return null
  const category = await req.payload.findByID({
    collection: 'categories',
    id: categoryID,
    depth: 0,
    disableErrors: true,
    overrideAccess: true,
    req,
    select: { slug: true },
  })
  return category?.slug ? postPath(category.slug, doc.slug) : null
}

/** Normalizes the source ("https://site/Foo?x" -> "/Foo/"). */
export const normalizeRedirectSource: CollectionBeforeValidateHook = ({ data }) => {
  if (data && typeof data.from === 'string') data.from = normalizePath(data.from)
  if (data?.to && typeof data.to.url === 'string') data.to.url = data.to.url.trim()
  return data
}

/** Loads the other redirects of the tenant, as summaries. */
export const tenantRedirects = async (
  req: PayloadRequest,
  tenant: TenantID,
): Promise<RedirectSummary[]> => {
  const { docs } = await req.payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    req,
    where: { tenant: { equals: tenant } },
    select: { from: true, destinationPath: true, active: true },
  })
  return docs.map((doc) => ({
    id: doc.id,
    from: doc.from,
    destinationPath: doc.destinationPath ?? null,
    active: doc.active,
  }))
}

/** Published content living at `path` in the tenant (page, blog post, blog category or help page), if any. */
export const publishedDocumentAt = async (req: PayloadRequest, tenant: TenantID, path: string) => {
  const byTenant = { tenant: { equals: tenant } }
  const published = { _status: { equals: 'published' } }
  const common = { depth: 0, limit: 1, overrideAccess: true, req } as const

  const post = parsePostPath(path)
  if (post) {
    const { docs } = await req.payload.find({
      collection: 'posts',
      ...common,
      where: {
        and: [
          byTenant,
          published,
          { slug: { equals: post.slug } },
          { 'category.slug': { equals: post.categorySlug } },
        ],
      },
    })
    if (docs[0]) return { collection: 'posts' as const, id: docs[0].id }
  }

  const help = parseHelpPath(path)
  if (help) {
    const { docs } = await req.payload.find({
      collection: 'help-topics',
      ...common,
      depth: 1,
      where: { and: [byTenant, published, { slug: { equals: help.topicSlug } }] },
    })
    const topic = docs[0]
    const questionExists =
      !help.questionSlug ||
      (topic?.faqs ?? []).some((faq) => typeof faq === 'object' && faq.slug === help.questionSlug)
    if (topic && questionExists) return { collection: 'help-topics' as const, id: topic.id }
  }

  const category = /^\/blog\/([^/]+)\/$/.exec(path)
  if (category) {
    const { docs } = await req.payload.find({
      collection: 'categories',
      ...common,
      where: { and: [byTenant, { slug: { equals: category[1] } }] },
    })
    if (docs[0]) return { collection: 'categories' as const, id: docs[0].id }
  }

  const { docs } = await req.payload.find({
    collection: 'pages',
    ...common,
    where: {
      and: [
        byTenant,
        published,
        { slug: { equals: path === '/' ? 'home' : path.replace(/^\/|\/$/g, '') } },
      ],
    },
  })
  return docs[0] ? { collection: 'pages' as const, id: docs[0].id } : null
}

/**
 * Computes `destinationPath` and enforces the redirect rules: no duplicated source, no loop,
 * no chain, and an active redirect must not hide a published page.
 */
export const validateRedirect: CollectionBeforeChangeHook<Redirect> = async ({
  collection,
  data,
  originalDoc,
  req,
}) => {
  const tenant = relationID(data.tenant ?? originalDoc?.tenant)
  const from = data.from ?? originalDoc?.from
  if (tenant === null || !from) return data

  const to = (data.to ?? originalDoc?.to) as To | undefined
  const destinationPath = await resolveDestinationPath(req, tenant, to)
  const active = data.active ?? originalDoc?.active ?? true

  const errors = checkRedirect(
    { id: originalDoc?.id, from, destinationPath },
    await tenantRedirects(req, tenant),
  )

  if (to?.type === 'reference' && destinationPath === null) {
    errors.push({ path: 'to', message: 'O documento de destino não foi encontrado.' })
  }

  if (active && (await publishedDocumentAt(req, tenant, from))) {
    errors.push({
      path: 'from',
      message: `Existe um conteúdo publicado em ${from}: este redirect o esconderia. Desative o redirect ou mude o endereço do conteúdo.`,
    })
  }

  if (errors.length > 0) throw new ValidationError({ collection: collection.slug, errors }, req.t)

  return { ...data, destinationPath }
}

// ---------------------------------------------------------------------------------------
// Automatic redirects when published content changes its URL
// ---------------------------------------------------------------------------------------

type Destination =
  { reference: { relationTo: RoutableCollection; value: number } } | { url: string }

/**
 * Creates the redirect oldPath -> destination and keeps the redirect graph flat: redirects that
 * pointed to oldPath now point to the destination, and redirects whose source is newPath (they
 * would hide the new URL) are removed. Runs with overrideAccess: automatic redirects are
 * created even when the editor cannot edit redirects.
 */
export async function applyUrlChange({
  req,
  tenant,
  oldPath,
  newPath,
  destination,
}: {
  req: PayloadRequest
  tenant: TenantID
  oldPath: string
  newPath: string
  destination: Destination
}): Promise<void> {
  if (oldPath === newPath) return

  const common = { overrideAccess: true, req } as const
  const byTenant = { tenant: { equals: tenant } }
  const to =
    'reference' in destination
      ? { type: 'reference' as const, reference: destination.reference }
      : { type: 'custom' as const, url: destination.url }

  // 1. Redirects from the new URL would hide it.
  await req.payload.delete({
    collection: 'redirects',
    where: { and: [byTenant, { from: { equals: newPath } }] },
    ...common,
  })

  // 2. Redirects to the old URL now go straight to the destination (no chain).
  const { docs: pointingToOld } = await req.payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 0,
    pagination: false,
    where: { and: [byTenant, { destinationPath: { equals: oldPath } }] },
    ...common,
  })
  for (const redirect of pointingToOld) {
    if (redirect.from === oldPath) continue
    await req.payload.update({ collection: 'redirects', id: redirect.id, data: { to }, ...common })
  }

  // 3. Old URL -> destination (updates an existing redirect from the old URL, if any).
  const { docs: existing } = await req.payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 1,
    where: { and: [byTenant, { from: { equals: oldPath } }] },
    ...common,
  })
  const data = {
    from: oldPath,
    to,
    type: '301' as const,
    active: true,
    origin: 'auto' as const,
    tenant,
  }

  if (existing[0]) {
    await req.payload.update({ collection: 'redirects', id: existing[0].id, data, ...common })
  } else {
    await req.payload.create({ collection: 'redirects', data, ...common })
  }

  req.payload.logger.info(`Automatic redirect ${oldPath} -> ${newPath}`)
}

const contextKey = (collection: string, id: TenantID) => `publishedPath:${collection}:${id}`

/**
 * Before publishing, remembers the URL of the currently published version. Drafts (and
 * autosave) may already carry the new slug, so the previous version is not enough.
 */
export const rememberPublishedPath =
  (collection: RoutableCollection): CollectionBeforeChangeHook =>
  async ({ data, operation, originalDoc, req }) => {
    if (operation !== 'update' || data._status !== 'published' || !originalDoc?.id) return data

    const published = await req.payload
      .findByID({
        collection,
        id: originalDoc.id,
        depth: 1,
        draft: false,
        overrideAccess: true,
        req,
      })
      .catch(() => null)

    if (published?._status === 'published' && published.slug) {
      const path = documentPath(collection, published)
      if (path) req.context[contextKey(collection, originalDoc.id)] = path
    }
    return data
  }

/** After publishing with a new URL (slug or, for posts, category), creates the redirect. */
export const createRedirectOnUrlChange =
  (collection: RoutableCollection): CollectionAfterChangeHook =>
  async ({ doc, req }) => {
    const oldPath = req.context[contextKey(collection, doc.id)] as string | undefined
    if (!oldPath || doc._status !== 'published') return doc

    const newPath = await routablePath(req, collection, doc)
    const tenant = relationID(doc.tenant)
    if (!newPath || oldPath === newPath || tenant === null) return doc

    await applyUrlChange({
      req,
      tenant,
      oldPath,
      newPath,
      destination: { reference: { relationTo: collection, value: doc.id } },
    })
    return doc
  }

/**
 * Blog category slug change: every published post of the category and the category page
 * change URL, so each old URL gets its redirect.
 */
export const redirectCategoryOnSlugChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const oldSlug = previousDoc?.slug as string | undefined
  const tenant = relationID(doc.tenant)
  if (operation !== 'update' || !oldSlug || oldSlug === doc.slug || tenant === null) return doc

  const { docs: posts } = await req.payload.find({
    collection: 'posts',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    req,
    where: { and: [{ category: { equals: doc.id } }, { _status: { equals: 'published' } }] },
    select: { slug: true },
  })

  for (const post of posts) {
    if (!post.slug) continue
    await applyUrlChange({
      req,
      tenant,
      oldPath: postPath(oldSlug, post.slug),
      newPath: postPath(doc.slug, post.slug),
      destination: { reference: { relationTo: 'posts', value: post.id } },
    })
  }

  await applyUrlChange({
    req,
    tenant,
    oldPath: blogCategoryPath(oldSlug),
    newPath: blogCategoryPath(doc.slug),
    destination: { url: blogCategoryPath(doc.slug) },
  })

  return doc
}
