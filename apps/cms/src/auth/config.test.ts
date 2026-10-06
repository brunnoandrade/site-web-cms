import { afterEach, describe, expect, it, vi } from 'vitest'

import { isLocalAuthEnabled } from './config'

describe('isLocalAuthEnabled', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('is on by default outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('AUTH_LOCAL_ENABLED', '')
    expect(isLocalAuthEnabled()).toBe(true)
  })

  it('is off by default in production (fails closed)', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('AUTH_LOCAL_ENABLED', '')
    expect(isLocalAuthEnabled()).toBe(false)
  })

  it('an explicit value always wins', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('AUTH_LOCAL_ENABLED', 'true')
    expect(isLocalAuthEnabled()).toBe(true)
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('AUTH_LOCAL_ENABLED', 'false')
    expect(isLocalAuthEnabled()).toBe(false)
  })
})
