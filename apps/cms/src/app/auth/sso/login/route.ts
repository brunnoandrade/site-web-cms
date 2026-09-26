import { NextResponse } from 'next/server'

import { getSsoSettings, isSsoEnabled } from '@/auth/config'
import { client, getOidcConfiguration, getRedirectURI } from '@/auth/oidc'
import { signSsoFlow, SSO_FLOW_COOKIE } from '@/auth/tokens'
import { loginPageWithError, cookieOptions } from '@/auth/responses'

/** Starts the SSO login: redirects to RH-SSO/Keycloak (Authorization Code + PKCE). */
export async function GET(): Promise<Response> {
  if (!isSsoEnabled()) return loginPageWithError('sso_disabled')

  try {
    const config = await getOidcConfiguration()

    const verifier = client.randomPKCECodeVerifier()
    const state = client.randomState()
    const nonce = client.randomNonce()

    const authorizationURL = client.buildAuthorizationUrl(config, {
      redirect_uri: getRedirectURI(),
      scope: 'openid email profile',
      code_challenge: await client.calculatePKCECodeChallenge(verifier),
      code_challenge_method: 'S256',
      state,
      nonce,
    })

    const response = NextResponse.redirect(authorizationURL)
    response.cookies.set(SSO_FLOW_COOKIE, await signSsoFlow({ state, nonce, verifier }), {
      ...cookieOptions(getSsoSettings().serverURL),
      path: '/auth/sso',
      maxAge: 10 * 60,
    })
    return response
  } catch (err) {
    console.error('[sso] login failed', err)
    return loginPageWithError('sso_failed')
  }
}

export const dynamic = 'force-dynamic'
