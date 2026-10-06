import type { Access, AccessArgs, Where } from 'payload'

import type { User } from '@digio/payload-types'

/** Roles a user can have inside a tenant (users.tenants[].roles). */
export const TENANT_ROLES = ['admin', 'editor', 'seo'] as const
export type TenantRole = (typeof TENANT_ROLES)[number]

type MaybeUser = Partial<User> | null | undefined

/** Platform-wide administrator: sees and manages every tenant. */
export const isSuperAdmin = (user: MaybeUser): boolean =>
  Boolean(user?.roles?.includes('super-admin'))

/**
 * Service account used by the website to read drafts in preview (API key, no admin login).
 * Read-only on every tenant.
 */
export const isPreviewReader = (user: MaybeUser): boolean =>
  Boolean(user?.roles?.includes('preview'))

const relationID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    return (value as { id: number | string }).id
  }
  return null
}

/** IDs of the tenants where the user has at least one of `roles`. */
export const getTenantIDsWithRoles = (
  user: MaybeUser,
  roles: readonly TenantRole[],
): (number | string)[] =>
  (user?.tenants ?? [])
    .filter((row) => row.roles?.some((role) => roles.includes(role)))
    .map((row) => relationID(row.tenant))
    .filter((id): id is number | string => id !== null)

/** Whether the user can use the admin panel at all. */
export const canAccessAdmin = ({ req: { user } }: AccessArgs<User>): boolean =>
  isSuperAdmin(user) || getTenantIDsWithRoles(user, TENANT_ROLES).length > 0

/**
 * Access for tenant-scoped collections: super-admins can do everything; other users only act
 * on documents of tenants where they have one of `roles`.
 *
 * The multi-tenant plugin additionally limits every query to the user's tenants; this adds the
 * per-tenant role check on top of it.
 */
export const tenantRoles =
  (roles: readonly TenantRole[], field = 'tenant'): Access =>
  ({ req: { user }, data }) => {
    if (!user) return false
    if (isSuperAdmin(user)) return true

    const tenantIDs = getTenantIDsWithRoles(user, roles)
    if (tenantIDs.length === 0) return false

    // `create` must return a boolean: check the tenant being assigned, if already known.
    const assignedTenant = relationID((data as Record<string, unknown> | undefined)?.[field])
    if (assignedTenant !== null) {
      return tenantIDs.map(String).includes(String(assignedTenant))
    }

    return { [field]: { in: tenantIDs } } satisfies Where
  }

/**
 * Read access for versioned content: the public sees published documents; the preview
 * service account sees everything; editors see drafts of their tenants.
 */
export const publishedOrTenantMember: Access = (args) => {
  const { user } = args.req
  if (!user) return { _status: { equals: 'published' } }
  if (isPreviewReader(user)) return true
  return tenantRoles(TENANT_ROLES)(args)
}

/**
 * `readVersions` access: the versions table keeps the document's fields under `version.`, so
 * the tenant filter has to target `version.tenant` (a plain `tenant` filter fails with a 500).
 */
export const tenantRolesForVersions = (roles: readonly TenantRole[]): Access =>
  tenantRoles(roles, 'version.tenant')

export const anyone: Access = () => true

export const superAdminOnly: Access = ({ req: { user } }) => isSuperAdmin(user)
