import React from 'react'

import type { Post } from '@/payload-types'

import { find } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { pathsOf } from '@/lib/urlStyle'

import { UberPostView, type LatestPost } from './View'

/** Latest posts of the property for the side column (4, so one can be the post itself). */
export async function latestPostsOf(tenant: string): Promise<LatestPost[]> {
  const urls = pathsOf(await requireTenant(tenant))
  const { docs } = await find('posts', {
    tenant,
    depth: 1,
    limit: 4,
    sort: '-publishedAt',
    select: { title: true, slug: true, category: true, meta: true },
    tags: ['posts'],
  })
  return docs.map((item) => {
    const category = typeof item.category === 'object' ? item.category : null
    return {
      id: item.id,
      title: item.title,
      href: category && item.slug ? urls.post(category.slug, item.slug) : '#',
      image: typeof item.meta?.image === 'object' ? item.meta.image : null,
    }
  })
}

export async function UberPost({ post, tenant }: { post: Post; tenant: string }) {
  return <UberPostView post={post} latest={await latestPostsOf(tenant)} />
}
