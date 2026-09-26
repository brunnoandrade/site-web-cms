import type { Author } from '@digio/payload-types'

/**
 * Formats a post's authors into a readable list, in Portuguese.
 * @example
 * [Ana] -> 'Ana'
 * [Ana, Bruno] -> 'Ana e Bruno'
 * [Ana, Bruno, Carla] -> 'Ana, Bruno e Carla'
 */
export const formatAuthors = (authors: (Author | number | null | undefined)[]) => {
  const authorNames = authors
    .map((author) => (author && typeof author === 'object' ? author.name : null))
    .filter(Boolean) as string[]

  if (authorNames.length === 0) return ''
  if (authorNames.length === 1) return authorNames[0]!

  return `${authorNames.slice(0, -1).join(', ')} e ${authorNames[authorNames.length - 1]}`
}
