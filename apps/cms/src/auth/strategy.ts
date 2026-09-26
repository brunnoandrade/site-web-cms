import type { AuthStrategy, Payload } from 'payload'

import { isSsoEnabled } from './config'
import { readCookie, SSO_SESSION_COOKIE, verifySsoSession } from './tokens'

/**
 * Same CSRF rule Payload applies to its own session cookie (auth/extractJWT): the cookie only
 * counts when the request comes from an allowed origin, or from a same-site browser request.
 */
export const isCookieRequestAllowed = (headers: Headers, payload: Pick<Payload, 'config'>) => {
  const { csrf } = payload.config
  const origin = headers.get('Origin')

  if (origin) return csrf.length === 0 || csrf.includes(origin)
  if (csrf.length === 0) return true

  const secFetchSite = headers.get('Sec-Fetch-Site')
  return secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none'
}

/**
 * Payload auth strategy for SSO sessions. Independent from the local strategy: it only reads
 * the SSO session cookie and only authenticates users whose provider is `sso`.
 *
 * The session is revoked server-side when the user's `ssoSessionVersion` changes (logout).
 */
export const ssoStrategy: AuthStrategy = {
  name: 'sso',
  authenticate: async ({ headers, payload }) => {
    if (!isSsoEnabled()) return { user: null }

    const token = readCookie(headers, SSO_SESSION_COOKIE)
    if (!token || !isCookieRequestAllowed(headers, payload)) return { user: null }

    const session = await verifySsoSession(token)
    if (!session) return { user: null }

    const user = await payload
      .findByID({ collection: 'users', id: session.uid, depth: 0, disableErrors: true })
      .catch(() => null)

    if (!user || user.authProvider !== 'sso' || (user.ssoSessionVersion ?? 0) !== session.ver) {
      return { user: null }
    }

    return { user: { ...user, collection: 'users', _strategy: 'sso' } }
  },
}
