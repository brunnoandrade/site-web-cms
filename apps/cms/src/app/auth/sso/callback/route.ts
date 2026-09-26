import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { getSsoSettings, isSsoEnabled } from '@/auth/config'
import { client, getOidcConfiguration, getRedirectURI } from '@/auth/oidc'
import { provisionSsoUser, SsoLoginError } from '@/auth/provisionSsoUser'
import { cookieOptions, loginPageWithError } from '@/auth/responses'
import {
  readCookie,
  signSsoSession,
  SSO_FLOW_COOKIE,
  SSO_ID_TOKEN_COOKIE,
  SSO_SESSION_COOKIE,
  verifySsoFlow,
} from '@/auth/tokens'

/**
 * SSO callback. openid-client validates the authorization response (state), exchanges the
 * code with the PKCE verifier and validates the ID token (signature, iss, aud, exp, nonce).
 * Only then the CMS user is resolved and the SSO session cookie is issued.
 */
export async function GET(request: NextRequest): Promise<Response> {
  if (!isSsoEnabled()) return loginPageWithError('sso_disabled')

  const flow = await verifySsoFlow(readCookie(request.headers, SSO_FLOW_COOKIE) ?? '')

  const fail = (code: Parameters<typeof loginPageWithError>[0]) => {
    const response = loginPageWithError(code)
    response.cookies.set(SSO_FLOW_COOKIE, '', { path: '/auth/sso', maxAge: 0 })
    return response
  }

  // No flow cookie: expired, replayed or started in another browser.
  if (!flow) return fail('sso_failed')

  const settings = getSsoSettings()
  let claims: client.IDToken
  let idToken: string | undefined

  try {
    const oidc = await getOidcConfiguration()

    // The URL registered at the IdP: behind proxies request.url may carry an internal host.
    const currentURL = new URL(getRedirectURI())
    currentURL.search = request.nextUrl.search

    const tokens = await client.authorizationCodeGrant(oidc, currentURL, {
      pkceCodeVerifier: flow.verifier,
      expectedState: flow.state,
      expectedNonce: flow.nonce,
      idTokenExpected: true,
    })

    const idTokenClaims = tokens.claims()
    if (!idTokenClaims) return fail('invalid_claims')
    claims = idTokenClaims
    idToken = tokens.id_token
  } catch (err) {
    console.error('[sso] callback validation failed', err)
    return fail('sso_failed')
  }

  try {
    const payload = await getPayload({ config })
    const user = await provisionSsoUser(payload, claims, {
      superAdminRole: settings.superAdminRole,
    })

    const response = NextResponse.redirect(`${settings.serverURL}/admin`)
    const options = cookieOptions(settings.serverURL)

    response.cookies.set(
      SSO_SESSION_COOKIE,
      await signSsoSession(
        { uid: String(user.id), ver: user.ssoSessionVersion ?? 0 },
        settings.sessionTTL,
      ),
      { ...options, path: '/', maxAge: settings.sessionTTL },
    )
    // Kept only to end the RH-SSO session on logout (id_token_hint).
    if (idToken) {
      response.cookies.set(SSO_ID_TOKEN_COOKIE, idToken, {
        ...options,
        path: '/auth/sso',
        maxAge: settings.sessionTTL,
      })
    }
    response.cookies.set(SSO_FLOW_COOKIE, '', { path: '/auth/sso', maxAge: 0 })
    return response
  } catch (err) {
    if (err instanceof SsoLoginError) return fail(err.code)
    console.error('[sso] user provisioning failed', err)
    return fail('sso_failed')
  }
}

export const dynamic = 'force-dynamic'
