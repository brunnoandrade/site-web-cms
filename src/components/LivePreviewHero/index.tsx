'use client'

import type { Page } from '@/payload-types'

import { useLivePreview } from '@payloadcms/live-preview-react'
import React from 'react'

import { RenderHero } from '@/heros/RenderHero'
import { relayRequest } from '@/lib/livePreviewRelay'

type Props = {
  initialData: Page
  /** Origin of the admin (postMessage is accepted only from it). */
  cmsURL: string
}

/**
 * Hero of a page whose body is not made of blocks (the blog listing), for the admin's live
 * preview. It follows the form through postMessage, like LivePreviewPage.
 */
export const LivePreviewHero: React.FC<Props> = ({ initialData, cmsURL }) => {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL: cmsURL,
    depth: 2,
    requestHandler: relayRequest,
  })

  return data.template !== 'noHero' && data.hero ? <RenderHero {...data.hero} /> : null
}
