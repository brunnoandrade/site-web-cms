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
import { ImageContentBlock } from '@/blocks/ImageContent/Component'
import { PartnerBlock } from '@/blocks/Partner/Component'
import { StoryBlock } from '@/blocks/Story/Component'
import { TimelineBlock } from '@/blocks/Timeline/Component'
import { ContactsBlock } from '@/blocks/Contacts/Component'
import { DocumentsBlock } from '@/blocks/Documents/Component'
import { StepsBlock } from '@/blocks/Steps/Component'
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
  steps: StepsBlock,
  imageContent: ImageContentBlock,
  partner: PartnerBlock,
  story: StoryBlock,
  timeline: TimelineBlock,
  contacts: ContactsBlock,
  documents: DocumentsBlock,
  testimonials: TestimonialsBlock,
}

/** Blocks that render their own full-width section (or none), so they get no default one. */
const ownSection = new Set(['partner', 'story', 'timeline', 'contacts', 'documents'])

/** Image band with a mobile version (Uber Conta divider): 3rem above and below, not the 6rem section. */
const isBand = (block: { blockType: string; mediaMobile?: unknown }) =>
  block.blockType === 'mediaBlock' && Boolean(block.mediaMobile)

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  /** Tenant slug: blocks that query the CMS (e.g. archive) are scoped to it. */
  tenant: string
  /**
   * The archive block fetches its posts, which only a server component can do. The public page
   * passes the server one; the live preview (client) passes a view fed with prefetched posts.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- server and preview views take different props
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
              const rendered = <Block {...block} disableInnerContainer tenant={tenant} />
              const anchor = 'anchor' in block && block.anchor ? block.anchor : undefined
              // Blocks with a "theme" field render their own full-width Section; the others get
              // the default (white) section around them.
              const content =
                'theme' in block || ownSection.has(blockType) || isBand(block as never) ? (
                  rendered
                ) : (
                  <Section>{rendered}</Section>
                )
              // The anchor id goes on a plain wrapper, so a `#id` link lands on the section.
              return anchor ? (
                <div id={anchor} key={index}>
                  {content}
                </div>
              ) : (
                <Fragment key={index}>{content}</Fragment>
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
