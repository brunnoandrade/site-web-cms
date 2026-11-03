import { describe, expect, it } from 'vitest'

import { isAdminHost, isAdminHostAllowed } from './adminHost'

describe('isAdminHostAllowed', () => {
  it('allows every host when ADMIN_HOST is empty', () => {
    expect(isAdminHostAllowed('digio.com.br', undefined)).toBe(true)
    expect(isAdminHostAllowed('digio.com.br', '')).toBe(true)
    expect(isAdminHostAllowed('digio.com.br', '  ')).toBe(true)
  })

  it('allows only the configured host', () => {
    expect(isAdminHostAllowed('admin.digio.com.br', 'admin.digio.com.br')).toBe(true)
    expect(isAdminHostAllowed('digio.com.br', 'admin.digio.com.br')).toBe(false)
    expect(isAdminHostAllowed('uberconta.com.br', 'admin.digio.com.br')).toBe(false)
  })

  it('ignores case and, without a port in ADMIN_HOST, the request port', () => {
    expect(isAdminHostAllowed('Admin.Digio.com.br:8443', 'admin.digio.com.br')).toBe(true)
  })

  it('requires the port when ADMIN_HOST has one', () => {
    expect(isAdminHostAllowed('localhost:3000', 'localhost:3000')).toBe(true)
    expect(isAdminHostAllowed('localhost:3001', 'localhost:3000')).toBe(false)
    expect(isAdminHostAllowed('localhost', 'localhost:3000')).toBe(false)
  })

  it('does not match a host that only ends with the configured one', () => {
    expect(isAdminHostAllowed('evil-admin.digio.com.br', 'admin.digio.com.br')).toBe(false)
  })
})

describe('isAdminHost', () => {
  it('is false when ADMIN_HOST is not set', () => {
    expect(isAdminHost('localhost:3000', undefined)).toBe(false)
  })

  it('is true only for the admin host', () => {
    expect(isAdminHost('admin.digio.com.br', 'admin.digio.com.br')).toBe(true)
    expect(isAdminHost('digio.com.br', 'admin.digio.com.br')).toBe(false)
  })
})
