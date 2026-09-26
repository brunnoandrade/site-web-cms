import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearTenantCache, normalizeHost, resolveTenantSlug } from './tenantResolver'

describe('normalizeHost', () => {
  it('lowercases and strips the port', () => {
    expect(normalizeHost('WWW.Digio.com.br:443')).toBe('www.digio.com.br')
  })

  it('keeps only the first host of a forwarded list', () => {
    expect(normalizeHost('campanha.localhost:3000, proxy.internal')).toBe('campanha.localhost')
  })
})

describe('resolveTenantSlug', () => {
  beforeEach(() => clearTenantCache())

  it('resolves a host to its tenant', async () => {
    const fetchTenant = vi.fn().mockResolvedValue('digio')
    await expect(resolveTenantSlug('localhost:3000', { fetchTenant })).resolves.toBe('digio')
    expect(fetchTenant).toHaveBeenCalledWith('localhost')
  })

  it('returns null for unknown hosts', async () => {
    const fetchTenant = vi.fn().mockResolvedValue(null)
    await expect(resolveTenantSlug('desconhecido.com', { fetchTenant })).resolves.toBeNull()
  })

  it('caches lookups until they expire', async () => {
    const fetchTenant = vi.fn().mockResolvedValue('digio')
    await resolveTenantSlug('localhost', { fetchTenant, now: 0 })
    await resolveTenantSlug('localhost', { fetchTenant, now: 30_000 })
    expect(fetchTenant).toHaveBeenCalledTimes(1)

    await resolveTenantSlug('localhost', { fetchTenant, now: 61_000 })
    expect(fetchTenant).toHaveBeenCalledTimes(2)
  })

  it('keeps serving the last known tenant when the CMS is down', async () => {
    await resolveTenantSlug('localhost', { fetchTenant: async () => 'digio', now: 0 })

    const failing = vi.fn().mockRejectedValue(new Error('CMS down'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(
      resolveTenantSlug('localhost', { fetchTenant: failing, now: 120_000 }),
    ).resolves.toBe('digio')
    warn.mockRestore()
  })

  it('fails when the CMS is down and the host was never resolved', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('CMS down'))
    await expect(resolveTenantSlug('novo.com', { fetchTenant: failing })).rejects.toThrow(
      'CMS down',
    )
  })
})
