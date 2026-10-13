import { describe, expect, it } from 'vitest'

import { hasAnyAccess, mapClaimsToAccess } from './claims'

const known = new Set(['digio', 'uber-conta'])
const map = (claims: Record<string, unknown>) =>
  mapClaimsToAccess(
    { sub: 'x', ...claims },
    { superAdminRole: 'cms-super-admin', knownTenantSlugs: known },
  )

describe('mapClaimsToAccess', () => {
  it('maps tenant groups to per-tenant roles', () => {
    const access = map({
      groups: ['/tenants/digio/editor', '/tenants/digio/seo', '/tenants/uber-conta/admin'],
    })
    expect(Object.fromEntries(access.tenants)).toEqual({
      digio: ['editor', 'seo'],
      'uber-conta': ['admin'],
    })
    expect(access.superAdmin).toBe(false)
  })

  it('maps the configured realm role to super-admin', () => {
    expect(map({ roles: ['offline_access', 'cms-super-admin'] }).superAdmin).toBe(true)
  })

  it('ignores unknown tenants, unknown roles and malformed groups', () => {
    const access = map({
      groups: [
        '/tenants/outra-propriedade/admin',
        '/tenants/digio/super-admin',
        '/tenants/digio',
        'tenants/digio/editor',
        '/tenants/digio/editor/extra',
        '/tenants/DIGIO/editor',
        42,
      ],
      roles: 'cms-super-admin',
    })
    expect(access.tenants.size).toBe(0)
    expect(access.superAdmin).toBe(false)
    expect(hasAnyAccess(access)).toBe(false)
  })

  it('does not duplicate roles', () => {
    expect(
      map({ groups: ['/tenants/digio/editor', '/tenants/digio/editor'] }).tenants.get('digio'),
    ).toEqual(['editor'])
  })
})
