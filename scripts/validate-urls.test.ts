import { describe, expect, it } from 'vitest'

import { checkUrl, readUrlList, rebase, withProbe, type Fetcher } from './validate-urls.lib'

const site =
  (routes: Record<string, { status: number; location?: string }>): Fetcher =>
  async (url) => {
    const { pathname, search } = new URL(url)
    const route = routes[pathname] ?? { status: 404 }
    const location = route.location
      ? `${route.location}${route.location.includes('?') ? '' : search}`
      : null
    return { status: route.status, location }
  }

const url = 'https://site.test/antiga/?utm_source=validacao-urls'

describe('checkUrl', () => {
  it('accepts 200', async () => {
    expect((await checkUrl('https://site.test/ok/', site({ '/ok/': { status: 200 } }))).ok).toBe(
      true,
    )
  })

  it('accepts 301 -> 200 keeping the query string', async () => {
    const result = await checkUrl(
      url,
      site({ '/antiga/': { status: 301, location: '/nova/' }, '/nova/': { status: 200 } }),
    )
    expect(result).toMatchObject({ ok: true, reason: '301 → 200' })
  })

  it('refuses a chain', async () => {
    const result = await checkUrl(
      url,
      site({
        '/antiga/': { status: 301, location: '/meio/' },
        '/meio/': { status: 301, location: '/fim/' },
      }),
    )
    expect(result).toMatchObject({ ok: false, reason: expect.stringMatching(/cadeia/) })
  })

  it('refuses a redirect that drops the query string', async () => {
    const fetcher: Fetcher = async (u) =>
      new URL(u).pathname === '/antiga/'
        ? { status: 301, location: '/nova/' }
        : { status: 200, location: null }
    expect(await checkUrl(url, fetcher)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/query string/),
    })
  })

  it('refuses temporary redirects and explains the trailing slash case', async () => {
    const temp = await checkUrl(url, site({ '/antiga/': { status: 302, location: '/nova/' } }))
    expect(temp.reason).toMatch(/302, deveria ser 301/)
    const slash = await checkUrl(
      'https://site.test/sem-barra',
      site({ '/sem-barra': { status: 308, location: '/sem-barra/' } }),
    )
    expect(slash.reason).toMatch(/barra final/)
  })

  it('refuses a destination that is not 200', async () => {
    const result = await checkUrl(url, site({ '/antiga/': { status: 301, location: '/sumiu/' } }))
    expect(result).toMatchObject({ ok: false, reason: 'destino respondeu 404' })
  })

  it('reports network errors', async () => {
    const result = await checkUrl(url, async () => Promise.reject(new Error('ECONNREFUSED')))
    expect(result.reason).toMatch(/erro de rede/)
  })
})

describe('helpers', () => {
  it('rebases production URLs onto another environment', () => {
    expect(rebase('https://www.digio.com.br/cartao/?a=1', 'https://hml.digio.local')).toBe(
      'https://hml.digio.local/cartao/?a=1',
    )
    expect(rebase('/cartao/', 'http://localhost:3000')).toBe('http://localhost:3000/cartao/')
  })

  it('adds the probe parameter once', () => {
    expect(withProbe('https://s.test/a/')).toBe('https://s.test/a/?utm_source=validacao-urls')
    expect(withProbe('https://s.test/a/?utm_source=x')).toBe('https://s.test/a/?utm_source=x')
  })

  it('reads URL lists with or without a header', () => {
    expect(readUrlList('url;obs\nhttps://a.test/x/;1\n')).toEqual(['https://a.test/x/'])
    expect(readUrlList('/x/\n/y/\n')).toEqual(['/x/', '/y/'])
    expect(readUrlList('﻿origem,destino\n/a/,/b/\n')).toEqual(['/a/'])
  })
})
