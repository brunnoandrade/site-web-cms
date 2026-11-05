'use client'

import type { Post } from '@/payload-types'

import { useLivePreview } from '@payloadcms/live-preview-react'
import React from 'react'

import { DefaultPostView } from '@/components/PostPage/DefaultPostView'
import { UberPostView, type LatestPost } from '@/components/UberPost/View'
import { relayRequest } from '@/lib/livePreviewRelay'
import { getCMSPublicURL } from '@/utilities/getURL'

type Props = {
  initialData: Post
  variant: 'default' | 'uber'
  /** Uber layout: latest posts, fetched by the server when the page loaded. */
  latest: LatestPost[]
}

/**
 * Post body for the admin's live preview. It follows the form through postMessage
 * (useLivePreview), so editing a field re-renders in place: no router refresh, no reload.
 */
export const LivePreviewPost: React.FC<Props> = ({ initialData, variant, latest }) => {
  const { data } = useLivePreview<Post>({
    initialData,
    serverURL: getCMSPublicURL(),
    depth: 2,
    requestHandler: relayRequest,
  })

  return variant === 'uber' ? (
    <UberPostView post={data} latest={latest} />
  ) : (
    <DefaultPostView post={data} />
  )
}
