import { slugField } from 'payload'
import { toSlug } from '@digio/routes'

/**
 * Payload's slug field with a slugify that keeps Portuguese words readable: the default one
 * drops accented letters ("cartão" -> "carto"); this one transliterates ("cartao").
 */
type SlugFieldArgs = NonNullable<Parameters<typeof slugField>[0]>

export const slug = (args: SlugFieldArgs = {}) =>
  slugField({ ...args, slugify: ({ valueToSlugify }) => toSlug(valueToSlugify) })
