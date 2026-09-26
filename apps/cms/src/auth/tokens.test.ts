import { SignJWT } from 'jose'
import { beforeAll, describe, expect, it } from 'vitest'

import { readCookie, signSsoFlow, signSsoSession, verifySsoFlow, verifySsoSession } from './tokens'

beforeAll(() => {
  process.env.PAYLOAD_SECRET = 'test-secret-for-sso-tokens'
})

describe('SSO session token', () => {
  it('round-trips a valid session', async () => {
    const token = await signSsoSession({ uid: '7', ver: 3 }, 60)
    await expect(verifySsoSession(token)).resolves.toEqual({ uid: '7', ver: 3 })
  })

  it('rejects a tampered token', async () => {
    const token = await signSsoSession({ uid: '7', ver: 3 }, 60)
    const [header, , signature] = token.split('.')
    const forged = Buffer.from(JSON.stringify({ uid: '1', ver: 3 })).toString('base64url')
    await expect(verifySsoSession(`${header}.${forged}.${signature}`)).resolves.toBeNull()
  })

  it('rejects an expired token', async () => {
    const token = await signSsoSession({ uid: '7', ver: 3 }, -1)
    await expect(verifySsoSession(token)).resolves.toBeNull()
  })

  it('rejects a token signed with another secret', async () => {
    const token = await signSsoSession({ uid: '7', ver: 3 }, 60)
    process.env.PAYLOAD_SECRET = 'another-secret'
    await expect(verifySsoSession(token)).resolves.toBeNull()
    process.env.PAYLOAD_SECRET = 'test-secret-for-sso-tokens'
  })

  it('does not accept a login-flow token as a session (different key and audience)', async () => {
    const flow = await signSsoFlow({ state: 's', nonce: 'n', verifier: 'v' })
    await expect(verifySsoSession(flow)).resolves.toBeNull()
  })

  it('rejects unsigned tokens (alg: none)', async () => {
    const unsigned = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(
      JSON.stringify({ uid: '1', ver: 0 }),
    ).toString('base64url')}.`
    await expect(verifySsoSession(unsigned)).resolves.toBeNull()
  })

  it('rejects a well-signed token with the wrong issuer', async () => {
    const { createHash } = await import('crypto')
    const key = new Uint8Array(
      createHash('sha256').update(`sso-session:${process.env.PAYLOAD_SECRET}`).digest(),
    )
    const token = await new SignJWT({ uid: '1', ver: 0 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('someone-else')
      .setAudience('sso-session')
      .setExpirationTime('1m')
      .sign(key)
    await expect(verifySsoSession(token)).resolves.toBeNull()
  })
})

describe('SSO login flow token', () => {
  it('round-trips state, nonce and PKCE verifier', async () => {
    const token = await signSsoFlow({ state: 's1', nonce: 'n1', verifier: 'v1' })
    await expect(verifySsoFlow(token)).resolves.toEqual({
      state: 's1',
      nonce: 'n1',
      verifier: 'v1',
    })
  })

  it('rejects garbage', async () => {
    await expect(verifySsoFlow('not-a-token')).resolves.toBeNull()
  })
})

describe('readCookie', () => {
  it('reads one cookie among many', () => {
    const headers = new Headers({ cookie: 'a=1; digio-sso-session=abc%3D; b=2' })
    expect(readCookie(headers, 'digio-sso-session')).toBe('abc=')
    expect(readCookie(headers, 'missing')).toBeNull()
  })
})
