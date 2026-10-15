import type { ArchiveBlock as ArchiveBlockProps } from '@digio/payload-types'

import React from 'react'

import { ArchiveBlockView } from './View'
import { getArchivePosts } from './data'
import { getMediumFeed } from './feed'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
    tenant: string
  }
> = async (props) => {
  const feed =
    props.variant === 'carousel' ? await getMediumFeed(props.feedUrl, props.limit || 6) : []
  // With a feed the CMS posts are not needed.
  const posts = feed.length > 0 ? [] : await getArchivePosts(props)

  return <ArchiveBlockView {...props} feed={feed} posts={posts} />
}
