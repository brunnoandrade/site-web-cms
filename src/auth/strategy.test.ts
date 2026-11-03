import { describe, expect, it } from 'vitest'

import { isCookieRequestAllowed } from './strategy'

const payload = { config: { csrf: ['http://localhost:3001', 'http://localhost:3000'] } } as never

describe('isCookieRequestAllowed (same rule as the Payload session cookie)', () => {
  it('accepts allowed origins', () => {
    expect(isCookieRequestAllowed(new Headers({ Origin: 'http://localhost:3001' }), payload)).toBe(
      true,
    )
  })

  it('rejects other origins', () => {
    expect(isCookieRequestAllowed(new Headers({ Origin: 'https://evil.example' }), payload)).toBe(
      false,
    )
  })

  it('accepts same-origin browser requests without Origin', () => {
    expect(isCookieRequestAllowed(new Headers({ 'Sec-Fetch-Site': 'same-origin' }), payload)).toBe(
      true,
    )
    expect(isCookieRequestAllowed(new Headers({ 'Sec-Fetch-Site': 'none' }), payload)).toBe(true)
  })

  it('rejects cross-site requests and clients without browser headers', () => {
    expect(isCookieRequestAllowed(new Headers({ 'Sec-Fetch-Site': 'cross-site' }), payload)).toBe(
      false,
    )
    expect(isCookieRequestAllowed(new Headers(), payload)).toBe(false)
  })
})
