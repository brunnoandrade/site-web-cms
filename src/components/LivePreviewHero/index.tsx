'use client'

import type { Page } from '@/payload-types'

import { useLivePreview } from '@payloadcms/live-preview-react'
import React from 'react'

import { RenderHero } from '@/heros/RenderHero'
import { relayRequest } from '@/lib/livePreviewRelay'
import { getCMSPublicURL } from '@/utilities/getURL'

type Props = { initialData: Page }

/**
 * Hero of a page whose body is not made of blocks (the blog listing), for the admin's live
 * preview. It follows the form through postMessage, like LivePreviewPage.
 */
export const LivePreviewHero: React.FC<Props> = ({ initialData }) => {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL: getCMSPublicURL(),
    depth: 2,
    requestHandler: relayRequest,
  })

  return data.template !== 'noHero' && data.hero ? <RenderHero {...data.hero} /> : null
}
