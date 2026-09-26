import { describe, expect, it } from 'vitest'

import { checkRedirect, customDestinationPath } from './rules'

const r = (from: string, destinationPath: string | null, id?: number) => ({
  id,
  from,
  destinationPath,
})

describe('customDestinationPath', () => {
  const domains = ['www.digio.com.br', 'digio.com.br']

  it('normalizes relative paths', () => {
    expect(customDestinationPath('/cartao?x=1', domains)).toBe('/cartao/')
  })

  it('treats absolute URLs on the tenant domains as internal', () => {
    expect(customDestinationPath('https://www.digio.com.br/cartao/', domains)).toBe('/cartao/')
  })

  it('returns null for external destinations', () => {
    expect(customDestinationPath('https://apps.apple.com/br/app/digio', domains)).toBeNull()
    expect(customDestinationPath('//outro.com/x', domains)).toBeNull()
  })
})

describe('checkRedirect', () => {
  it('accepts an independent redirect', () => {
    expect(checkRedirect(r('/a/', '/b/'), [r('/c/', '/d/', 1)])).toEqual([])
  })

  it('rejects a loop', () => {
    expect(checkRedirect(r('/a/', '/a/'), [])[0]?.message).toMatch(/loop/)
  })

  it('rejects a duplicated source', () => {
    expect(checkRedirect(r('/a/', '/b/'), [r('/a/', '/c/', 1)]).map((e) => e.path)).toContain(
      'from',
    )
  })

  it('rejects a chain through the destination (A -> B -> C)', () => {
    const [error] = checkRedirect(r('/a/', '/b/'), [r('/b/', '/c/', 1)])
    expect(error?.message).toMatch(/\/b\/ já redireciona para \/c\//)
  })

  it('rejects a chain through the source (X -> A -> B)', () => {
    const [error] = checkRedirect(r('/a/', '/b/'), [r('/x/', '/a/', 1)])
    expect(error?.message).toMatch(/\/x\/ já redireciona para \/a\//)
  })

  it('ignores itself when updating', () => {
    expect(checkRedirect(r('/a/', '/b/', 7), [r('/a/', '/b/', 7)])).toEqual([])
  })

  it('does not treat external destinations as chains', () => {
    expect(checkRedirect(r('/a/', null), [r('/x/', null, 1)])).toEqual([])
  })
})
