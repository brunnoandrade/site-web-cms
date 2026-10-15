import React from 'react'

import type { Media as MediaType, Page } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { HeroVideo } from './HeroVideo'

const urlOf = (media?: MediaType | number | null) =>
  typeof media === 'object' && media?.url ? getMediaUrl(media.url, media.updatedAt) : null

/**
 * Uber Conta hero, measured on the current site (breakpoint 768px).
 *
 * Desktop: black, at least 100vh tall, under the floating header. Title (fluid, 64px from 1200px)
 * and one call to action in a 570px column, vertically centered; the video covers the whole hero
 * (at least 900px tall, anchored to the top right).
 *
 * Mobile: the column is one screen tall with 15vh of top padding, the call to action is pushed to
 * the bottom (full width, arrow pointing down) and the legal note is centered under it. The video
 * (its own mobile file, usually vertical) keeps its proportions, full width, 100px above the bottom edge, behind the text.
 */
export const FullscreenHero: React.FC<Page['hero']> = ({ links, media, video, videoMobile, richText, disclaimer, disclaimerLink }) => {
  const videoSrc = urlOf(video as MediaType | number | null | undefined)
  const videoMobileSrc = urlOf(videoMobile as MediaType | number | null | undefined)
  const cover =
    'absolute inset-x-0 bottom-[100px] z-[1] h-auto w-full md:inset-x-auto md:bottom-auto md:right-0 md:top-0 md:h-full md:min-h-[900px] md:w-auto md:max-w-full md:object-cover'
  const cta = Array.isArray(links) ? links[0]?.link : undefined
  const isAnchor = Boolean(cta?.url?.startsWith('#'))

  return (
    <section
      className="relative -mt-24 flex min-h-screen overflow-hidden bg-navy-900 text-white"
      data-section-theme="navy"
    >
      {videoSrc ? (
        <HeroVideo className={cover} src={videoSrc} srcMobile={videoMobileSrc} />
      ) : (
        media &&
        typeof media === 'object' && (
          <div className={cn(cover, 'md:aspect-video')}>
            <Media fill imgClassName="object-cover" priority resource={media} />
          </div>
        )
      )}

      <div className="container relative z-[2] flex min-h-screen flex-col items-start justify-center">
        <div className="flex w-full max-w-[570px] flex-col max-md:h-screen max-md:pt-[15vh] md:block">
          {richText && (
            <RichText
              className="[&_h1]:mb-2 [&_h1]:text-[calc(1.525rem+3.3vw)] [&_h1]:font-semibold [&_h1]:leading-none min-[1200px]:[&_h1]:text-[4rem]"
              data={richText}
              enableGutter={false}
            />
          )}

          {cta && (
            <CMSLink
              {...cta}
              appearance="inverse"
              className="my-8 max-md:mb-4 max-md:mt-auto md:w-fit"
              size="lg"
            >
              <ArrowRightIcon className={cn('size-[15px]', isAnchor ? 'rotate-90' : 'max-md:rotate-90')} />
            </CMSLink>
          )}

          {disclaimer && (
            <p className="m-0 text-xs font-normal leading-normal text-[#bababa] max-md:mb-8 max-md:text-center">
              {disclaimer}
              {disclaimerLink?.label && (
                <>
                  {' '}
                  <CMSLink
                    {...disclaimerLink}
                    appearance="inline"
                    className="font-medium underline hover:text-white"
                  />
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
