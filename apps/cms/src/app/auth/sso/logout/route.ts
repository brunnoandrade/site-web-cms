import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { getSsoSettings, isSsoEnabled } from '@/auth/config'
import { client, getOidcConfiguration } from '@/auth/oidc'
import {
  readCookie,
  SSO_ID_TOKEN_COOKIE,
  SSO_SESSION_COOKIE,
  verifySsoSession,
} from '@/auth/tokens'

/**
 * SSO logout (separate from the local logout):
 * 1. revokes the user's SSO sessions in the CMS (ssoSessionVersion);
 * 2. clears the SSO cookies;
 * 3. ends the RH-SSO/Keycloak session (RP-initiated logout with id_token_hint) and returns to
 *    the admin login page.
 * POST only: with SameSite=Lax cookies a third-party site cannot log users out.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const settings = isSsoEnabled() ? getSsoSettings() : null
  const serverURL = settings?.serverURL ?? process.env.SERVER_URL ?? 'http://localhost:3001'
  const loginPage = `${serverURL}/admin/login`

  const session = await verifySsoSession(readCookie(request.headers, SSO_SESSION_COOKIE) ?? '')
  const idToken = readCookie(request.headers, SSO_ID_TOKEN_COOKIE)

  if (session) {
    const payload = await getPayload({ config })
    const user = await payload
      .findByID({ collection: 'users', id: session.uid, depth: 0, disableErrors: true })
      .catch(() => null)

    if (user?.authProvider === 'sso') {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { ssoSessionVersion: (user.ssoSessionVersion ?? 0) + 1 },
        context: { ssoProvisioning: true },
      })
    }
  }

  let destination = loginPage
  if (settings && idToken) {
    try {
      const oidc = await getOidcConfiguration()
      destination = client
        .buildEndSessionUrl(oidc, {
          id_token_hint: idToken,
          post_logout_redirect_uri: loginPage,
        })
        .toString()
    } catch (err) {
      console.error('[sso] could not build the RH-SSO logout URL', err)
    }
  }

  // 303: the browser follows with a GET.
  const response = NextResponse.redirect(destination, 303)
  response.cookies.set(SSO_SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(SSO_ID_TOKEN_COOKIE, '', { path: '/auth/sso', maxAge: 0 })
  return response
}

export const dynamic = 'force-dynamic'
