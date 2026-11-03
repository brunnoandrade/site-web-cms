import { describe, expect, it } from 'vitest'

import { assertStrongSecrets } from './assertSecrets'

const strong = {
  PAYLOAD_SECRET: 'a'.repeat(32),
  PREVIEW_SECRET: 'b'.repeat(32),
  REVALIDATE_SECRET: 'c'.repeat(32),
}
const prod = { NODE_ENV: 'production', SERVER_URL: 'https://cms.digio.com.br' } as const

describe('assertStrongSecrets', () => {
  it('accepts strong secrets in a deployed environment', () => {
    expect(() => assertStrongSecrets({ ...prod, ...strong })).not.toThrow()
  })

  it('rejects placeholder, short or missing secrets when deployed', () => {
    expect(() => assertStrongSecrets({ ...prod, ...strong, PREVIEW_SECRET: 'change-me' })).toThrow(
      /PREVIEW_SECRET/,
    )
    expect(() => assertStrongSecrets({ ...prod, ...strong, PAYLOAD_SECRET: 'short' })).toThrow(
      /PAYLOAD_SECRET/,
    )
    expect(() => assertStrongSecrets({ ...prod, ...strong, REVALIDATE_SECRET: undefined })).toThrow(
      /REVALIDATE_SECRET/,
    )
  })

  it('does not apply to local http setups or to the Docker build', () => {
    const weak = { PAYLOAD_SECRET: 'change-me' }
    expect(() =>
      assertStrongSecrets({ NODE_ENV: 'production', SERVER_URL: 'http://localhost:3001', ...weak }),
    ).not.toThrow()
    expect(() =>
      assertStrongSecrets({ ...prod, ...weak, NEXT_PHASE: 'phase-production-build' }),
    ).not.toThrow()
    expect(() => assertStrongSecrets({ NODE_ENV: 'development', ...weak })).not.toThrow()
  })
})
