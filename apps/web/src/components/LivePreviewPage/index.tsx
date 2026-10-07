'use client'

import type { Page, Post } from '@digio/payload-types'

import { useLivePreview } from '@payloadcms/live-preview-react'
import React from 'react'

import { ArchiveBlockView } from '@/blocks/ArchiveBlock/View'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { getCMSPublicURL } from '@/utilities/getURL'

// Goes through the site itself (see app/(frontend)/next/live-preview/route.ts), not the CMS.
const relayRequest = ({ data, endpoint }: { data: Record<string, any>; endpoint: string }) =>
  fetch('/next/live-preview/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, id: endpoint.split('/').pop() }),
  })

type Props = {
  initialData: Page
  tenant: string
  /** Posts of the archive blocks, by block id, fetched by the server when the page loaded. */
  archivePosts: Record<string, Post[]>
}

/**
 * Page body for the admin's live preview. It follows the form through postMessage
 * (useLivePreview), so editing a field re-renders in place: no router refresh, no reload.
 */
export const LivePreviewPage: React.FC<Props> = ({ initialData, tenant, archivePosts }) => {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL: getCMSPublicURL(),
    depth: 2,
    requestHandler: relayRequest,
  })

  const Archive = React.useMemo<React.FC<any>>(
    () =>
      function PreviewArchive(props) {
        return <ArchiveBlockView {...props} posts={archivePosts[props.id] ?? []} />
      },
    [archivePosts],
  )

  return (
    <>
      <RenderHero {...data.hero} />
      <RenderBlocks blocks={data.layout} tenant={tenant} archive={Archive} />
    </>
  )
}
