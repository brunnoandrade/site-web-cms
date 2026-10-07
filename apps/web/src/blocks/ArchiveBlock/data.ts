import 'server-only'

import type { Post, ArchiveBlock as ArchiveBlockProps } from '@digio/payload-types'

import { find } from '@/lib/cms'

/** Posts shown by an archive block: the latest ones of the chosen categories, or the picked ones. */
export async function getArchivePosts(
  props: Pick<ArchiveBlockProps, 'categories' | 'limit' | 'populateBy' | 'selectedDocs'> & {
    tenant: string
  },
): Promise<Post[]> {
  const { tenant, categories, limit: limitFromProps, populateBy, selectedDocs } = props
  const limit = limitFromProps || 3

  if (populateBy === 'collection') {
    const flattenedCategories = categories?.map((category) =>
      typeof category === 'object' ? category.id : category,
    )

    const fetchedPosts = await find('posts', {
      tenant,
      depth: 1,
      limit,
      sort: '-publishedAt',
      ...(flattenedCategories && flattenedCategories.length > 0
        ? { where: { category: { in: flattenedCategories } } }
        : {}),
    })

    return fetchedPosts.docs
  }

  return pickedPosts(selectedDocs)
}

/** Posts picked by hand that came populated (objects) from the API. */
export function pickedPosts(selectedDocs: ArchiveBlockProps['selectedDocs']): Post[] {
  return (selectedDocs ?? []).flatMap((post) =>
    typeof post.value === 'object' ? [post.value as Post] : [],
  )
}
