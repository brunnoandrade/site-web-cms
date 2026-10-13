import type { CollectionBeforeChangeHook } from 'payload'

import type { Page } from '@digio/payload-types'

// The "no hero" template hides the hero tab; this keeps a hero configured earlier from lingering
// in the data (and from being rendered by clients that ignore the template).
export const clearHeroWithoutHero: CollectionBeforeChangeHook<Page> = ({ data }) => {
  if (data.template === 'noHero') data.hero = { type: 'none' }

  return data
}
