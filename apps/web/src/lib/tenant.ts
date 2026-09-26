import 'server-only'

import { notFound } from 'next/navigation'
import { cache } from 'react'

import { findOne, getTenant, type Tenant } from './cms'

/** Tenant of the current route (`[tenant]` segment). Renders the 404 page when unknown. */
export const requireTenant = cache(async (slug: string): Promise<Tenant> => {
  const tenant = await getTenant(decodeURIComponent(slug))
  if (!tenant) notFound()
  return tenant
})

/** Blog category of the tenant by slug. Renders the 404 page when unknown. */
export const requireCategory = cache(async (tenant: string, slug: string) => {
  const category = await findOne('categories', {
    tenant,
    where: { slug: { equals: decodeURIComponent(slug) } },
  })
  if (!category) notFound()
  return category
})

/** Page number from the URL ("2"); anything else is a 404. */
export const parsePageNumber = (value: string): number => {
  const page = Number(value)
  if (!Number.isInteger(page) || page < 1) notFound()
  return page
}
