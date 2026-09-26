import type { CollectionBeforeValidateHook } from 'payload'
import { Forbidden } from 'payload'

import type { User } from '@digio/payload-types'

import { getTenantIDsWithRoles, isSuperAdmin } from '../../../access/roles'

type TenantRow = NonNullable<User['tenants']>[number]

const tenantKey = (row: TenantRow): string =>
  String(typeof row.tenant === 'object' && row.tenant ? row.tenant.id : row.tenant)

const rowSignature = (row: TenantRow): string =>
  `${tenantKey(row)}:${[...(row.roles ?? [])].sort().join(',')}`

/**
 * Prevents privilege escalation through the tenants array: a user who is not a super-admin
 * can only add, remove or change rows of tenants where they are an admin. This also stops
 * users from granting themselves roles when editing their own account.
 */
export const validateTenantAssignments: CollectionBeforeValidateHook<User> = ({
  data,
  originalDoc,
  req,
}) => {
  const actor = req.user as User | null | undefined

  // Local API calls without a user (seed, scripts, SSO provisioning) are trusted.
  if (!actor || isSuperAdmin(actor) || !data?.tenants) return data

  const adminTenants = new Set(getTenantIDsWithRoles(actor, ['admin']).map(String))
  const before = new Map((originalDoc?.tenants ?? []).map((row) => [tenantKey(row), row]))
  const after = new Map((data.tenants ?? []).map((row) => [tenantKey(row), row]))

  const changedTenants = new Set<string>()
  for (const [key, row] of after) {
    const previous = before.get(key)
    if (!previous || rowSignature(previous) !== rowSignature(row)) changedTenants.add(key)
  }
  for (const key of before.keys()) {
    if (!after.has(key)) changedTenants.add(key)
  }

  for (const key of changedTenants) {
    if (!adminTenants.has(key)) {
      throw new Forbidden(req.t)
    }
  }

  return data
}

/**
 * A tenant admin may only change another user's account (email, password, name, roles) when
 * that user has no platform role and belongs exclusively to tenants the admin manages.
 * Otherwise an admin of tenant A could take over an account that also has access to tenant B.
 */
export const guardOtherUserUpdates: CollectionBeforeValidateHook<User> = ({
  operation,
  originalDoc,
  req,
}) => {
  const actor = req.user as User | null | undefined

  if (operation !== 'update' || !actor || isSuperAdmin(actor) || !originalDoc) return
  if (String(originalDoc.id) === String(actor.id)) return

  const adminTenants = new Set(getTenantIDsWithRoles(actor, ['admin']).map(String))
  const targetTenants = (originalDoc.tenants ?? []).map(tenantKey)

  const manageable =
    (originalDoc.roles ?? []).length === 0 &&
    targetTenants.length > 0 &&
    targetTenants.every((key) => adminTenants.has(key))

  if (!manageable) throw new Forbidden(req.t)
}
