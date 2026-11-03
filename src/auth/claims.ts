import { TENANT_ROLES, type TenantRole } from '../access/roles'

/**
 * Maps the identity provider's claims to CMS access. The IdP is the source of truth for SSO
 * users: roles and tenants are recalculated on every SSO login.
 *
 * - `roles` (realm roles) containing `superAdminRole` -> platform super-admin;
 * - `groups` like `/tenants/<tenant-slug>/<admin|editor|seo>` -> role on that tenant.
 */

export type SsoClaims = {
  sub: string
  email?: unknown
  email_verified?: unknown
  name?: unknown
  groups?: unknown
  roles?: unknown
}

export type SsoAccess = {
  superAdmin: boolean
  /** Tenant slug -> roles. Only tenants that exist in the CMS are kept. */
  tenants: Map<string, TenantRole[]>
}

const GROUP_PATTERN = /^\/tenants\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z-]+)$/

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

export const mapClaimsToAccess = (
  claims: SsoClaims,
  { superAdminRole, knownTenantSlugs }: { superAdminRole: string; knownTenantSlugs: Set<string> },
): SsoAccess => {
  const tenants = new Map<string, TenantRole[]>()

  for (const group of strings(claims.groups)) {
    const match = GROUP_PATTERN.exec(group)
    if (!match) continue

    const [, slug, role] = match as unknown as [string, string, string]
    if (!knownTenantSlugs.has(slug) || !TENANT_ROLES.includes(role as TenantRole)) continue

    const roles = tenants.get(slug) ?? []
    if (!roles.includes(role as TenantRole)) roles.push(role as TenantRole)
    tenants.set(slug, roles)
  }

  return {
    superAdmin: strings(claims.roles).includes(superAdminRole),
    tenants,
  }
}

export const hasAnyAccess = (access: SsoAccess) => access.superAdmin || access.tenants.size > 0
