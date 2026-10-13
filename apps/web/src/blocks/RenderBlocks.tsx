import React, { Fragment } from 'react'

import { Section } from '@/components/Section'

import type { Page } from '@digio/payload-types'

import { BannerSectionBlock } from '@/blocks/BannerSection/Component'
import { CardsBlock } from '@/blocks/Cards/Component'
import { FaqBlock } from '@/blocks/Faq/Component'
import { ProductHighlightBlock } from '@/blocks/ProductHighlight/Component'
import { RatesTableBlock } from '@/blocks/RatesTable/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'

const blockComponents = {
  bannerSection: BannerSectionBlock,
  cards: CardsBlock,
  faq: FaqBlock,
  productHighlight: ProductHighlightBlock,
  ratesTable: RatesTableBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  mediaBlock: MediaBlock,
  testimonials: TestimonialsBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  /** Tenant slug: blocks that query the CMS (e.g. archive) are scoped to it. */
  tenant: string
  /**
   * The archive block fetches its posts, which only a server component can do. The public page
   * passes the server one; the live preview (client) passes a view fed with prefetched posts.
   */
  archive: React.ComponentType<any>
}> = (props) => {
  const { blocks, tenant, archive } = props
  const components = { ...blockComponents, archive }

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in components) {
            const Block = components[blockType]

            if (Block) {
              const rendered = (
                <Block {...block} disableInnerContainer tenant={tenant} />
              )
              // Blocks with a "theme" field render their own full-width Section; the others get
              // the default (white) section around them.
              return 'theme' in block ? (
                <Fragment key={index}>{rendered}</Fragment>
              ) : (
                <Section key={index}>{rendered}</Section>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
