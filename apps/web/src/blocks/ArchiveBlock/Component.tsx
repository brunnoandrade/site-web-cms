import type { ArchiveBlock as ArchiveBlockProps } from '@digio/payload-types'

import React from 'react'

import { ArchiveBlockView } from './View'
import { getArchivePosts } from './data'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
    tenant: string
  }
> = async (props) => {
  const posts = await getArchivePosts(props)

  return <ArchiveBlockView {...props} posts={posts} />
}
