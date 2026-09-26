/**
 * Admin authentication settings, per environment.
 *
 * Two independent authenticators:
 * - local: Payload's e-mail/password login (AUTH_LOCAL_ENABLED, default on; off in PRD per SoAD);
 * - sso: OIDC Authorization Code + PKCE against RH-SSO/Keycloak (AUTH_SSO_ENABLED).
 */

const flag = (value: string | undefined, fallback: boolean) =>
  value === undefined || value === '' ? fallback : value === 'true'

export const isLocalAuthEnabled = () => flag(process.env.AUTH_LOCAL_ENABLED, true)

export const isSsoEnabled = () => flag(process.env.AUTH_SSO_ENABLED, false)

export type SsoSettings = {
  issuer: URL
  clientId: string
  clientSecret: string
  /** Realm role (claim `roles`) that makes the user a platform super-admin. */
  superAdminRole: string
  /** SSO session lifetime, in seconds. */
  sessionTTL: number
  /** Public URL of this CMS, used to build the redirect URIs. */
  serverURL: string
}

export const getSsoSettings = (): SsoSettings => {
  const { OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET } = process.env

  if (!OIDC_ISSUER || !OIDC_CLIENT_ID || !OIDC_CLIENT_SECRET) {
    throw new Error(
      'SSO is enabled but OIDC_ISSUER, OIDC_CLIENT_ID or OIDC_CLIENT_SECRET is missing',
    )
  }

  return {
    issuer: new URL(OIDC_ISSUER),
    clientId: OIDC_CLIENT_ID,
    clientSecret: OIDC_CLIENT_SECRET,
    superAdminRole: process.env.OIDC_SUPER_ADMIN_ROLE || 'cms-super-admin',
    sessionTTL: Number(process.env.SSO_SESSION_HOURS || 8) * 60 * 60,
    serverURL: process.env.SERVER_URL || 'http://localhost:3001',
  }
}

export const ssoRoutes = {
  login: '/auth/sso/login',
  callback: '/auth/sso/callback',
  logout: '/auth/sso/logout',
} as const
