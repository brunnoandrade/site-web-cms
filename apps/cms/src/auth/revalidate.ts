import type { Payload } from 'payload'

import type { User } from '@digio/payload-types'

import type { SsoClaims } from './claims'
import { getSsoSettings } from './config'
import { client, getOidcConfiguration } from './oidc'
import { accessDataFor, SsoLoginError } from './provisionSsoUser'
import { decryptSecret, encryptSecret } from './tokens'

/**
 * Periodic re-check of an SSO user against the IdP.
 *
 * Roles and tenants are only read from the ID token at login, so without this a user removed
 * from a group, or disabled, in RH-SSO/Keycloak would keep their CMS access until the CMS
 * session expires. Every SSO_REVALIDATE_SECONDS (default 5 min) the stored refresh token is
 * exchanged for fresh claims: a definitive IdP refusal ends the CMS session, otherwise roles
 * and tenants are re-synced. If the IdP is unreachable, the session is kept for a grace period.
 */

const DEFAULT_INTERVAL_SECONDS = 300
const OUTAGE_GRACE_SECONDS = 60 * 60

export const revalidateIntervalSeconds = (): number => {
  const raw = process.env.SSO_REVALIDATE_SECONDS
  const value = raw ? Number(raw) : NaN
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_INTERVAL_SECONDS
}

export type Revalidation = 'fresh' | 'synced' | 'revoked'

const inFlight = new Map<string, Promise<Revalidation>>()

const revoke = async (payload: Payload, user: User): Promise<'revoked'> => {
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { ssoSessionVersion: (user.ssoSessionVersion ?? 0) + 1, ssoRefreshToken: null },
    context: { ssoProvisioning: true },
  })
  return 'revoked'
}

async function run(payload: Payload, user: User): Promise<Revalidation> {
  const syncedAt = user.ssoSyncedAt ? Date.parse(user.ssoSyncedAt) : 0
  const ageSeconds = (Date.now() - syncedAt) / 1000
  if (ageSeconds < revalidateIntervalSeconds()) return 'fresh'

  const refreshToken = user.ssoRefreshToken ? decryptSecret(user.ssoRefreshToken) : null
  // Sessions created before this check existed have no refresh token: sign in again.
  if (!refreshToken) return revoke(payload, user)

  try {
    const oidc = await getOidcConfiguration()
    const tokens = await client.refreshTokenGrant(oidc, refreshToken)
    const claims = tokens.claims() as SsoClaims | undefined

    if (!claims || claims.sub !== user.ssoSubject) return revoke(payload, user)

    const data = await accessDataFor(payload, claims, getSsoSettings().superAdminRole)

    await payload.update({
      collection: 'users',
      id: user.id,
      // The e-mail is managed at login; only access and the rotated refresh token change here.
      data: {
        roles: [...data.roles],
        tenants: data.tenants,
        ssoRefreshToken: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : null,
        ssoSyncedAt: new Date().toISOString(),
      },
      context: { ssoProvisioning: true },
    })
    return 'synced'
  } catch (err) {
    // The IdP answered with a refusal (disabled user, ended session, revoked token) or the user
    // lost every group: end the session.
    if (err instanceof client.ResponseBodyError || err instanceof SsoLoginError) {
      return revoke(payload, user)
    }
    // Network/IdP outage: keep working for a while instead of locking every editor out.
    console.error('[sso] could not re-check the user against the IdP', err)
    return ageSeconds < OUTAGE_GRACE_SECONDS + revalidateIntervalSeconds()
      ? 'fresh'
      : revoke(payload, user)
  }
}

/** One re-check per user at a time (parallel admin requests share the same refresh). */
export function revalidateSsoUser(payload: Payload, user: User): Promise<Revalidation> {
  const key = String(user.id)
  const pending = inFlight.get(key) ?? run(payload, user).finally(() => inFlight.delete(key))
  inFlight.set(key, pending)
  return pending
}
