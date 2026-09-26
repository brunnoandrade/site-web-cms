import React, { Fragment } from 'react'

import { Section } from '@/components/Section'

import type { Page } from '@digio/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerSectionBlock } from '@/blocks/BannerSection/Component'
import { CardsBlock } from '@/blocks/Cards/Component'
import { FaqBlock } from '@/blocks/Faq/Component'
import { ProductHighlightBlock } from '@/blocks/ProductHighlight/Component'
import { RatesTableBlock } from '@/blocks/RatesTable/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'

const blockComponents = {
  archive: ArchiveBlock,
  bannerSection: BannerSectionBlock,
  cards: CardsBlock,
  faq: FaqBlock,
  productHighlight: ProductHighlightBlock,
  ratesTable: RatesTableBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  testimonials: TestimonialsBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  /** Tenant slug: blocks that query the CMS (e.g. archive) are scoped to it. */
  tenant: string
}> = (props) => {
  const { blocks, tenant } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const rendered = (
                // @ts-expect-error there may be some mismatch between the expected types here
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
