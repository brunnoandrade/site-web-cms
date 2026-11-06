import type { PayloadRequest } from 'payload'

import { categorySlugOf, paths, urlStyleOf, type RoutableCollection, type UrlStyle } from '@/routes'

const relationID = (value: unknown): number | null => {
  const id =
    value && typeof value === 'object' && 'id' in value ? (value as { id: unknown }).id : value
  const number = typeof id === 'string' ? Number(id) : id
  return typeof number === 'number' && Number.isFinite(number) ? number : null
}

/** URL policy of the tenant (trailing slash form, flat blog posts). */
export const tenantUrlStyle = async (req: PayloadRequest, tenant: unknown): Promise<UrlStyle> => {
  const id = relationID(tenant)
  if (id === null) return urlStyleOf(null)
  const doc = await req.payload.findByID({
    collection: 'tenants',
    id,
    depth: 0,
    overrideAccess: true,
    req,
    select: { trailingSlash: true, blogUrlStyle: true },
  })
  return urlStyleOf(doc)
}

/**
 * Public URL of a page or post. A post needs its category slug; when the category is only an
 * ID (hooks receive depth 0 documents) it is loaded.
 */
export const routablePath = async (
  req: PayloadRequest,
  collection: RoutableCollection,
  doc: { slug?: string | null; category?: unknown; tenant?: unknown },
): Promise<string | null> => {
  const urls = paths(await tenantUrlStyle(req, doc.tenant))
  if (collection === 'pages' || categorySlugOf(doc.category as never)) {
    return urls.document(collection, doc as never)
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
  return category?.slug ? urls.post(category.slug, doc.slug) : null
}
