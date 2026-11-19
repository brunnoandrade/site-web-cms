import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./lib/tenantResolver', () => ({
  resolveTenant: vi.fn(async () => ({
    slug: 'digio',
    style: { trailingSlash: true, blogUrlStyle: 'nested' },
  })),
}))

import { proxy } from './proxy'

const request = (path: string) =>
  new NextRequest(`https://www.digio.test${path}`, { headers: { host: 'www.digio.test' } })

describe('proxy: frame-ancestors', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('reads SERVER_URL and ADMIN_HOST at request time', async () => {
    vi.stubEnv('SERVER_URL', 'https://cms.hml.test')
    vi.stubEnv('ADMIN_HOST', '')
    const res = await proxy(request('/sobre/'))
    expect(res.headers.get('content-security-policy')).toBe(
      "frame-ancestors 'self' https://cms.hml.test",
    )

    vi.stubEnv('SERVER_URL', 'https://cms.prd.test')
    const res2 = await proxy(request('/sobre/'))
    expect(res2.headers.get('content-security-policy')).toBe(
      "frame-ancestors 'self' https://cms.prd.test",
    )
  })
})
