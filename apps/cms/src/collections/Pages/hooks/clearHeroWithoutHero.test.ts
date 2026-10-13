import { describe, expect, it } from 'vitest'

import { clearHeroWithoutHero } from './clearHeroWithoutHero'

const run = (data: Record<string, unknown>) =>
  clearHeroWithoutHero({ data } as Parameters<typeof clearHeroWithoutHero>[0])

describe('clearHeroWithoutHero', () => {
  it('drops the hero of the "no hero" template', async () => {
    const data = { template: 'noHero', hero: { type: 'brand', media: 1 } }
    expect(await run(data)).toMatchObject({ hero: { type: 'none' } })
  })

  it.each(['default', 'landing', undefined])('keeps the hero for template %s', async (template) => {
    const hero = { type: 'brand', media: 1 }
    expect(await run({ template, hero })).toMatchObject({ hero })
  })
})
