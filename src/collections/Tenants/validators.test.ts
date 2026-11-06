import { describe, expect, it } from 'vitest'

import { matches, robotsRules } from './validators'

const call = (fn: unknown, value: string | null) => (fn as (v: string | null) => unknown)(value)

describe('matches', () => {
  const gtm = matches(/^GTM-[A-Z0-9]+$/, 'bad')
  it('accepts empty and valid values', () => {
    expect(call(gtm, '')).toBe(true)
    expect(call(gtm, null)).toBe(true)
    expect(call(gtm, 'GTM-ABC123')).toBe(true)
  })
  it('rejects other formats', () => {
    expect(call(gtm, 'UA-123')).toBe('bad')
  })
})

describe('robotsRules', () => {
  it('accepts Allow/Disallow lines, comments and blanks', () => {
    expect(call(robotsRules, '# nota\nDisallow: /busca/\n\nallow: /blog/')).toBe(true)
    expect(call(robotsRules, '')).toBe(true)
  })
  it('rejects directives that could change the file structure', () => {
    expect(call(robotsRules, 'User-agent: Googlebot')).toContain('Linha inválida')
    expect(call(robotsRules, 'Sitemap: https://x.com/s.xml')).toContain('Linha inválida')
    expect(call(robotsRules, 'Disallow: busca')).toContain('Linha inválida')
  })
})
