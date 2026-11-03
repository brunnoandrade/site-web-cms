import { describe, expect, it } from 'vitest'

import { hrefValidationMessage, isSafeHref } from './safeHref'

describe('isSafeHref', () => {
  it.each([
    '/cartao/',
    '/blog/categoria/post/?utm_source=x',
    '#topo',
    'https://www.digio.com.br/',
    'http://localhost:3000/a',
    'mailto:contato@digio.com.br',
    'tel:+551140020000',
  ])('accepts %s', (href) => expect(isSafeHref(href)).toBe(true))

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\nscript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    '//evil.com',
    '/\\evil.com',
    'cartao',
    '',
    '   ',
    null,
    42,
  ])('rejects %j', (href) => expect(isSafeHref(href)).toBe(false))

  it('web mode only allows http(s) and site paths (redirect destinations)', () => {
    expect(isSafeHref('https://parceiro.com/', { web: true })).toBe(true)
    expect(isSafeHref('/cartao/', { web: true })).toBe(true)
    expect(isSafeHref('mailto:a@b.com', { web: true })).toBe(false)
    expect(isSafeHref('#x', { web: true })).toBe(false)
  })

  it('validation message is true for empty and valid values', () => {
    expect(hrefValidationMessage('')).toBe(true)
    expect(hrefValidationMessage('/ok/')).toBe(true)
    expect(hrefValidationMessage('javascript:alert(1)')).toEqual(expect.any(String))
  })
})
