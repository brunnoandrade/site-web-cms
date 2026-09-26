import type { Category } from '@digio/payload-types'
import { blogCategoryPath, blogIndexPath, blogPagePath } from '@digio/routes'
import { notFound } from 'next/navigation'
import React from 'react'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { find } from '@/lib/cms'

export const POSTS_PER_PAGE = 12

type Props = {
  tenant: string
  /** Category page; the blog index when missing. */
  category?: Category
  page: number
}

/** Blog index and category pages, with the WordPress pagination URLs. */
export async function BlogListing({ tenant, category, page }: Props) {
  const posts = await find('posts', {
    tenant,
    depth: 1,
    limit: POSTS_PER_PAGE,
    page,
    sort: '-publishedAt',
    ...(category ? { where: { category: { equals: category.id } } } : {}),
    select: { title: true, slug: true, category: true, meta: true },
  })

  // /blog/page/99/ beyond the last page is a 404, not an empty listing.
  if (page > 1 && page > posts.totalPages) notFound()

  const hrefFor = (n: number) =>
    n === 1
      ? category
        ? blogCategoryPath(category.slug)
        : blogIndexPath
      : blogPagePath(n, category?.slug)

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose max-w-none">
          <h1>{category ? category.title : 'Blog'}</h1>
          {category?.description && <p>{category.description}</p>}
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={POSTS_PER_PAGE}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        <Pagination hrefFor={hrefFor} page={posts.page ?? 1} totalPages={posts.totalPages} />
      </div>
    </div>
  )
}
