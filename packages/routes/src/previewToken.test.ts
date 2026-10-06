import { describe, expect, it } from 'vitest'

import { createPreviewToken, PREVIEW_TOKEN_TTL_SECONDS, verifyPreviewToken } from './previewToken'

const secret = 'test-secret'
const target = { host: 'www.digio.com.br', path: '/blog/' }
const now = 1_700_000_000_000

describe('preview token', () => {
  it('accepts a fresh token for the same host and path', () => {
    const token = createPreviewToken(secret, target, now)
    expect(verifyPreviewToken(secret, token, target, now + 1000)).toBe(true)
  })

  it('rejects another path or another host (tenant)', () => {
    const token = createPreviewToken(secret, target, now)
    expect(verifyPreviewToken(secret, token, { ...target, path: '/outra/' }, now)).toBe(false)
    expect(verifyPreviewToken(secret, token, { ...target, host: 'campanha.digio.com.br' }, now)).toBe(
      false,
    )
  })

  it('rejects an expired token', () => {
    const token = createPreviewToken(secret, target, now)
    const later = now + (PREVIEW_TOKEN_TTL_SECONDS + 1) * 1000
    expect(verifyPreviewToken(secret, token, target, later)).toBe(false)
  })

  it('rejects a wrong secret, a tampered expiry and malformed tokens', () => {
    const token = createPreviewToken(secret, target, now)
    const [exp, sig] = token.split('.')
    expect(verifyPreviewToken('other', token, target, now)).toBe(false)
    expect(verifyPreviewToken(secret, `${Number(exp) + 3600}.${sig}`, target, now)).toBe(false)
    expect(verifyPreviewToken(secret, 'change-me', target, now)).toBe(false)
    expect(verifyPreviewToken(secret, null, target, now)).toBe(false)
    expect(verifyPreviewToken(undefined, token, target, now)).toBe(false)
  })
})
