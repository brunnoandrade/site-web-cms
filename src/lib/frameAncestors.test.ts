import { describe, expect, it } from 'vitest'

import { frameAncestors } from './frameAncestors'

describe('frameAncestors', () => {
  it('allows only itself without configuration', () => {
    expect(frameAncestors({})).toBe("'self'")
  })

  it('adds the origin of SERVER_URL and the admin host', () => {
    expect(
      frameAncestors({ SERVER_URL: 'https://cms.hml.digio.com.br/', ADMIN_HOST: 'admin.digio.com.br' }),
    ).toBe("'self' https://cms.hml.digio.com.br https://admin.digio.com.br")
  })

  it('ignores an invalid SERVER_URL', () => {
    expect(frameAncestors({ SERVER_URL: 'not a url' })).toBe("'self'")
  })
})
