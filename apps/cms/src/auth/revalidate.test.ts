import { afterEach, describe, expect, it, vi } from 'vitest'

import { revalidateIntervalSeconds } from './revalidate'

describe('revalidateIntervalSeconds', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('defaults to 5 minutes', () => {
    vi.stubEnv('SSO_REVALIDATE_SECONDS', '')
    expect(revalidateIntervalSeconds()).toBe(300)
  })

  it('uses a valid override and ignores garbage', () => {
    vi.stubEnv('SSO_REVALIDATE_SECONDS', '3')
    expect(revalidateIntervalSeconds()).toBe(3)
    vi.stubEnv('SSO_REVALIDATE_SECONDS', 'abc')
    expect(revalidateIntervalSeconds()).toBe(300)
  })
})
