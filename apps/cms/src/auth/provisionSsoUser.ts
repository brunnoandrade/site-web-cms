import type { Payload } from 'payload'

import type { User } from '@digio/payload-types'

import { hasAnyAccess, mapClaimsToAccess, type SsoClaims } from './claims'

/** Reasons an SSO login is refused; shown on the login page as `?sso_error=<code>`. */
export type SsoErrorCode =
  | 'invalid_claims'
  | 'email_not_verified'
  | 'local_account'
  | 'subject_mismatch'
  | 'no_access'
  | 'sso_failed'
  | 'sso_disabled'

export class SsoLoginError extends Error {
  constructor(readonly code: SsoErrorCode) {
    super(code)
    this.name = 'SsoLoginError'
  }
}

/**
 * Finds or creates the CMS user for a validated ID token.
 *
 * One provider per user: an e-mail that belongs to a local account is never linked to an SSO
 * identity (and vice versa), so neither authenticator can be used to reach the other's account.
 */
export async function provisionSsoUser(
  payload: Payload,
  claims: SsoClaims,
  { superAdminRole }: { superAdminRole: string },
): Promise<User> {
  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : ''
  if (!claims.sub || !email) throw new SsoLoginError('invalid_claims')
  if (claims.email_verified !== true) throw new SsoLoginError('email_not_verified')

  const bySubject = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: { ssoSubject: { equals: claims.sub } },
  })
  const user: User | undefined = bySubject.docs[0]

  if (!user) {
    const byEmail = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      where: { email: { equals: email } },
    })
    const existing = byEmail.docs[0]
    // Accounts without a provider predate SSO and are local.
    if (existing && existing.authProvider !== 'sso') throw new SsoLoginError('local_account')
    if (existing) throw new SsoLoginError('subject_mismatch')
  } else if (user.authProvider !== 'sso') {
    throw new SsoLoginError('local_account')
  }

  const { docs: tenantDocs } = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 0,
    pagination: false,
    select: { slug: true },
  })
  const tenantIDBySlug = new Map(tenantDocs.map((tenant) => [tenant.slug, tenant.id]))

  const access = mapClaimsToAccess(claims, {
    superAdminRole,
    knownTenantSlugs: new Set(tenantIDBySlug.keys()),
  })
  if (!hasAnyAccess(access)) throw new SsoLoginError('no_access')

  const data = {
    email,
    name: typeof claims.name === 'string' ? claims.name : email,
    roles: access.superAdmin ? (['super-admin'] as const) : [],
    tenants: [...access.tenants].map(([slug, roles]) => ({
      tenant: tenantIDBySlug.get(slug)!,
      roles,
    })),
  }

  // Trusted server-side call: the IdP decides roles and tenants.
  const context = { ssoProvisioning: true }

  if (user) {
    return payload.update({
      collection: 'users',
      id: user.id,
      data: { ...data, roles: [...data.roles] },
      context,
    })
  }

  return payload.create({
    collection: 'users',
    context,
    data: {
      ...data,
      roles: [...data.roles],
      authProvider: 'sso',
      ssoSubject: claims.sub,
      // Never used: SSO users cannot log in with a password (see blockSsoUsersFromLocalLogin).
      password: crypto.randomUUID() + crypto.randomUUID(),
    },
  })
}
