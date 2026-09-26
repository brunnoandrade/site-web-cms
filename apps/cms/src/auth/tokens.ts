import { createHash } from 'crypto'
import { jwtVerify, SignJWT, type JWTPayload } from 'jose'

/**
 * Signed tokens (HS256) stored in httpOnly cookies:
 * - the SSO session (who is logged in through SSO);
 * - the login flow (state, nonce and PKCE verifier between /login and /callback).
 * Keys are derived from PAYLOAD_SECRET with a different label per purpose.
 */

export const SSO_SESSION_COOKIE = 'digio-sso-session'
export const SSO_FLOW_COOKIE = 'digio-sso-flow'
export const SSO_ID_TOKEN_COOKIE = 'digio-sso-idt'

type Purpose = 'sso-session' | 'sso-flow'

const keyFor = (purpose: Purpose): Uint8Array => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is not set')
  return new Uint8Array(createHash('sha256').update(`${purpose}:${secret}`).digest())
}

const ISSUER = 'digio-cms'

async function sign(purpose: Purpose, payload: JWTPayload, ttlSeconds: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(purpose)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(keyFor(purpose))
}

async function verify<T>(purpose: Purpose, token: string): Promise<(T & JWTPayload) | null> {
  try {
    const { payload } = await jwtVerify(token, keyFor(purpose), {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: purpose,
    })
    return payload as T & JWTPayload
  } catch {
    return null
  }
}

/** SSO session: user id and the user's `ssoSessionVersion` at login (bumped on logout). */
export type SsoSession = { uid: string; ver: number }

export const signSsoSession = (session: SsoSession, ttlSeconds: number) =>
  sign('sso-session', session, ttlSeconds)

export const verifySsoSession = async (token: string): Promise<SsoSession | null> => {
  const payload = await verify<SsoSession>('sso-session', token)
  if (!payload || typeof payload.uid !== 'string' || typeof payload.ver !== 'number') return null
  return { uid: payload.uid, ver: payload.ver }
}

/** Login flow: bound to the browser that started it; valid for 10 minutes. */
export type SsoFlow = { state: string; nonce: string; verifier: string }

export const signSsoFlow = (flow: SsoFlow) => sign('sso-flow', flow, 10 * 60)

export const verifySsoFlow = async (token: string): Promise<SsoFlow | null> => {
  const payload = await verify<SsoFlow>('sso-flow', token)
  if (
    !payload ||
    typeof payload.state !== 'string' ||
    typeof payload.nonce !== 'string' ||
    typeof payload.verifier !== 'string'
  ) {
    return null
  }
  return { state: payload.state, nonce: payload.nonce, verifier: payload.verifier }
}

/** Reads one cookie from a Cookie header. */
export const readCookie = (headers: Headers, name: string): string | null => {
  const header = headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}
