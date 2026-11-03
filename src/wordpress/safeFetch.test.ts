import { describe, expect, it } from 'vitest'

import { assertFetchable, fetchPublicImage, isPrivateAddress } from './safeFetch'

const publicDNS = async () => [{ address: '93.184.216.34' }]
const trusted = ['https://wp.test']

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:10.0.0.1',
  ])('%s is private', (ip) => expect(isPrivateAddress(ip)).toBe(true))

  it.each(['93.184.216.34', '8.8.8.8', '172.32.0.1', '2606:2800:220:1::1'])('%s is public', (ip) =>
    expect(isPrivateAddress(ip)).toBe(false),
  )
})

describe('assertFetchable', () => {
  it('accepts public hosts and trusted origins', async () => {
    await expect(
      assertFetchable('https://cdn.example.com/a.png', [], publicDNS),
    ).resolves.toBeUndefined()
    await expect(
      assertFetchable('https://wp.test/a.png', trusted, async () => []),
    ).resolves.toBeUndefined()
  })

  it.each([
    'http://127.0.0.1/a.png',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/a.png',
    'http://localhost:3001/api/users',
    'http://db.internal/a.png',
    'file:///etc/passwd',
    'ftp://example.com/a.png',
  ])('refuses %s', async (url) => {
    await expect(assertFetchable(url, [], publicDNS)).rejects.toThrow()
  })

  it('refuses a hostname that resolves to a private address (DNS pointing inside)', async () => {
    await expect(
      assertFetchable('https://evil.example.com/a.png', [], async () => [{ address: '10.0.0.5' }]),
    ).rejects.toThrow(/interno/)
  })
})

describe('fetchPublicImage', () => {
  const ok = (body = 'png') =>
    new Response(body, { status: 200, headers: { 'content-type': 'image/png' } })

  it('downloads a public image', async () => {
    const { data, contentType } = await fetchPublicImage('https://cdn.example.com/a.png', {
      trustedOrigins: [],
      resolve: publicDNS,
      fetch: async () => ok('abc'),
    })
    expect(data.toString()).toBe('abc')
    expect(contentType).toBe('image/png')
  })

  it('re-checks redirects: a public URL cannot bounce to the metadata service', async () => {
    const calls: string[] = []
    const fetcher = async (url: string | URL | Request) => {
      calls.push(String(url))
      return new Response(null, {
        status: 302,
        headers: { location: 'http://169.254.169.254/latest/' },
      })
    }
    await expect(
      fetchPublicImage('https://cdn.example.com/a.png', {
        trustedOrigins: [],
        resolve: publicDNS,
        fetch: fetcher as typeof fetch,
      }),
    ).rejects.toThrow()
    expect(calls).toEqual(['https://cdn.example.com/a.png'])
  })

  it('refuses oversized responses and redirect loops', async () => {
    await expect(
      fetchPublicImage('https://cdn.example.com/a.png', {
        trustedOrigins: [],
        resolve: publicDNS,
        maxBytes: 2,
        fetch: async () => ok('toolong'),
      }),
    ).rejects.toThrow(/grande demais/)

    await expect(
      fetchPublicImage('https://cdn.example.com/a.png', {
        trustedOrigins: [],
        resolve: publicDNS,
        fetch: async () => new Response(null, { status: 302, headers: { location: '/b.png' } }),
      }),
    ).rejects.toThrow(/redirects demais/)
  })
})
