'use client'

import type { Page, Post } from '@/payload-types'

import { useLivePreview } from '@payloadcms/live-preview-react'
import React from 'react'

import { ArchiveBlockView } from '@/blocks/ArchiveBlock/View'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { relayRequest } from '@/lib/livePreviewRelay'
import { getCMSPublicURL } from '@/utilities/getURL'

type Props = {
  initialData: Page
  tenant: string
  /** Posts of the archive blocks, by block id, fetched by the server when the page loaded. */
  archivePosts: Record<string, Post[]>
  /** Menu (with the skip link) and footer, rendered by the server; shown unless the template is "landing". */
  header: React.ReactNode
  footer: React.ReactNode
}

/**
 * Page body for the admin's live preview. It follows the form through postMessage
 * (useLivePreview), so editing a field re-renders in place: no router refresh, no reload.
 */
export const LivePreviewPage: React.FC<Props> = ({
  initialData,
  tenant,
  archivePosts,
  header,
  footer,
}) => {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL: getCMSPublicURL(),
    depth: 2,
    requestHandler: relayRequest,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- same contract as RenderBlocks `archive`
  const Archive = React.useMemo<React.FC<any>>(
    () =>
      function PreviewArchive(props) {
        return <ArchiveBlockView {...props} posts={archivePosts[props.id] ?? []} />
      },
    [archivePosts],
  )

  // The template is part of the form, so menu and footer follow it too (see SiteChrome).
  const bare = data.template === 'landing'
  const heroOffset = bare && data.hero?.type === 'brand' ? 'pt-24' : undefined

  return (
    <>
      {!bare && header}
      <main className={bare ? undefined : 'pt-24'} id="conteudo" tabIndex={-1}>
        <article className={heroOffset}>
          {data.template !== 'noHero' && <RenderHero {...data.hero} />}
          <RenderBlocks blocks={data.layout} tenant={tenant} archive={Archive} />
        </article>
      </main>
      {!bare && footer}
    </>
  )
}
