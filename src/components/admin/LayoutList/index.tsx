import type { ListViewServerProps } from 'payload'
import React from 'react'

import { getTenantIDsWithRoles, isSuperAdmin, TENANT_ROLES } from '@/access/roles'

import { LayoutListClient, type LayoutRow } from './client'

/**
 * List view of Cabeçalho and Rodapé: one row per property the user can reach, instead of the
 * multi-tenant plugin's automatic jump to the selected property's document. Which property a
 * document belongs to is always visible here, and picking one switches the selected property.
 */
export const LayoutList = async ({ collectionSlug, payload, user }: ListViewServerProps) => {
  const slug = collectionSlug as 'header' | 'footer'
  const allowed = isSuperAdmin(user) ? null : getTenantIDsWithRoles(user, TENANT_ROLES)

  const tenants = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 200,
    pagination: false,
    sort: 'name',
    select: { name: true, siteUrl: true },
    ...(allowed ? { where: { id: { in: allowed } } } : {}),
  })

  const docs = await payload.find({
    collection: slug,
    depth: 0,
    limit: 200,
    pagination: false,
    select: { tenant: true, updatedAt: true },
    user,
    overrideAccess: false,
  })

  const byTenant = new Map(
    docs.docs.map((doc) => [
      typeof doc.tenant === 'object' ? doc.tenant?.id : doc.tenant,
      { id: doc.id, updatedAt: doc.updatedAt },
    ]),
  )

  const rows: LayoutRow[] = tenants.docs.map((tenant) => ({
    tenantID: tenant.id,
    name: tenant.name,
    siteUrl: tenant.siteUrl,
    docID: byTenant.get(tenant.id)?.id ?? null,
    updatedAt: byTenant.get(tenant.id)?.updatedAt ?? null,
  }))

  return (
    <LayoutListClient
      collectionSlug={slug}
      rows={rows}
      title={slug === 'header' ? 'Cabeçalho' : 'Rodapé'}
    />
  )
}
