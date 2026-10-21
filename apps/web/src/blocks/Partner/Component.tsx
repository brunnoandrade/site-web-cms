import React from 'react'

import type { PartnerBlock as Props } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Lines, Paragraphs } from '@/components/Lines'
import { CMSLink } from '@/components/Link'
import { Section } from '@/components/Section'
import { HeroVideo } from '@/heros/FullscreenHero/HeroVideo'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const urlOf = (media: Props['video']) =>
  typeof media === 'object' && media?.url ? getMediaUrl(media.url, media.updatedAt) : null

/**
 * Uber Conta "parceria": centered title (parts in blue), text and button over a background video
 * (the video sits at the bottom of the section, 85vh tall on mobile and 100vh on desktop).
 */
export const PartnerBlock: React.FC<Props> = ({ heading, text, enableLink, link, video, videoMobile }) => {
  const src = urlOf(video)
  const srcMobile = urlOf(videoMobile)

  return (
    <Section className="relative h-[85vh] overflow-hidden min-[992px]:h-screen" spacing="none" theme="light">
      {src && (
        <HeroVideo
          className="absolute bottom-0 left-0 z-[1] h-auto min-h-full w-full object-cover min-[992px]:min-h-0"
          src={src}
          srcMobile={srcMobile}
        />
      )}
      <div className="container relative z-[5] mx-auto max-w-[740px] pt-24 text-center">
        <h2 className="my-8 text-3xl font-semibold tracking-tight md:text-title">
          <Lines highlightClassName="text-[#276ef1]" text={heading} />
        </h2>
        {text && <Paragraphs className="mb-4 mt-0 font-light text-[#4b4b4b]" text={text} />}
        {enableLink && link && (
          <CMSLink {...link} appearance="default" className="mt-4" size="lg">
            <ArrowRightIcon className="size-[15px]" />
          </CMSLink>
        )}
      </div>
    </Section>
  )
}
