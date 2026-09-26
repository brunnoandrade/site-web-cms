import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildRules,
  getRedirectRules,
  invalidateRedirects,
  matchRedirect,
  withQuery,
} from './redirects'

describe('withQuery (keeps utm_*, gclid, fbclid)', () => {
  it('appends the request query to a relative destination', () => {
    expect(withQuery('/novo/', '?utm_source=google&gclid=abc')).toBe(
      '/novo/?utm_source=google&gclid=abc',
    )
  })

  it('keeps the destination parameters and adds the others', () => {
    expect(withQuery('/novo/?c=promo', '?c=outro&fbclid=1')).toBe('/novo/?c=promo&fbclid=1')
  })

  it('works with absolute destinations', () => {
    expect(withQuery('https://apps.apple.com/br/app/digio', '?utm_medium=cpc')).toBe(
      'https://apps.apple.com/br/app/digio?utm_medium=cpc',
    )
  })

  it('leaves the destination untouched without a query', () => {
    expect(withQuery('/novo/#faq', '')).toBe('/novo/#faq')
  })
})

describe('matchRedirect', () => {
  const rules = buildRules([
    { from: '/antiga/', type: '301', destinationPath: '/nova/', to: { type: 'reference' } },
    {
      from: '/cartão/',
      type: '302',
      to: { type: 'custom', url: '/cartao/?origem=legado' },
      destinationPath: '/cartao/',
    },
    {
      from: '/app/',
      to: { type: 'custom', url: 'https://www.digio.com.br/app/' },
      destinationPath: null,
    },
  ])

  it('matches with or without the trailing slash', () => {
    expect(matchRedirect(rules, '/antiga', '')).toEqual({ location: '/nova/', status: 301 })
    expect(matchRedirect(rules, '/antiga/', '?utm_source=x')).toEqual({
      location: '/nova/?utm_source=x',
      status: 301,
    })
  })

  it('matches percent-encoded paths and uses the configured status', () => {
    expect(matchRedirect(rules, '/cart%C3%A3o/', '?gclid=1')).toEqual({
      location: '/cartao/?origem=legado&gclid=1',
      status: 302,
    })
  })

  it('uses the typed URL for custom destinations', () => {
    expect(matchRedirect(rules, '/app/', '')?.location).toBe('https://www.digio.com.br/app/')
  })

  it('returns null when there is no redirect', () => {
    expect(matchRedirect(rules, '/outra/', '')).toBeNull()
  })
})

describe('getRedirectRules', () => {
  beforeEach(() => invalidateRedirects())

  const docs = [{ from: '/a/', destinationPath: '/b/' }]

  it('caches the table and refreshes it after the TTL', async () => {
    const fetch = vi.fn().mockResolvedValue(docs)
    await getRedirectRules('digio', { fetch, now: 0 })
    await getRedirectRules('digio', { fetch, now: 30_000 })
    expect(fetch).toHaveBeenCalledTimes(1)
    await getRedirectRules('digio', { fetch, now: 61_000 })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('refetches right after invalidation (webhook)', async () => {
    const fetch = vi.fn().mockResolvedValue(docs)
    await getRedirectRules('digio', { fetch, now: 0 })
    invalidateRedirects('digio')
    await getRedirectRules('digio', { fetch, now: 1 })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('keeps the last table when the CMS is down', async () => {
    await getRedirectRules('digio', { fetch: async () => docs, now: 0 })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const rules = await getRedirectRules('digio', {
      fetch: () => Promise.reject(new Error('down')),
      now: 120_000,
    })
    expect(rules.get('/a/')?.destination).toBe('/b/')
    warn.mockRestore()
  })

  it('serves no redirects (instead of failing) when the CMS was never reached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const rules = await getRedirectRules('novo', { fetch: () => Promise.reject(new Error('down')) })
    expect(rules.size).toBe(0)
    warn.mockRestore()
  })
})
