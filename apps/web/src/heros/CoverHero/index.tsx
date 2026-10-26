import React from 'react'

import type { Page } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { HelpSearch } from '@/components/HelpSearch'
import { CMSLink } from '@/components/Link'
import { Picture } from '@/components/Picture'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

/**
 * Uber Conta inner-page hero (current site: `.hero.cover`). One screen tall, the cover image (own
 * file for mobile, under 992px) behind a 570px column vertically centered: optional logo,
 * tagline (h6, the site's .display-7: 600 and calc(1.275rem + 0.3vw), on mobile 500 and 1rem), title (h1), text, one call to action and an optional legal note. White text on
 * dark images (default) or black text on light ones. An anchor link ("#id") gets a down arrow.
 */
export const CoverHero: React.FC<Page['hero']> = ({
  links,
  media,
  mediaMobile,
  richText,
  tone,
  logo,
  disclaimer,
  disclaimerLink,
  size,
  searchPlaceholder,
}) => {
  const cta = Array.isArray(links) ? links[0]?.link : undefined
  const isAnchor = Boolean(cta?.url?.startsWith('#'))
  const onLight = tone === 'onLight'
  const half = size === 'half'

  const hero = (
    <section
      className={cn(
        'relative -mt-24 flex overflow-hidden',
        half ? 'min-h-0' : 'min-h-screen',
        onLight ? 'bg-white text-black' : 'bg-black text-white',
      )}
      data-section-theme={onLight ? 'light' : 'navy'}
    >
      <Picture
        alt=""
        className="absolute inset-0 z-0 size-full object-cover"
        image={media as never}
        loading="eager"
        mobile={mediaMobile as never}
      />
      <div
        className={cn(
          'container relative z-[2] flex flex-col',
          half
            ? 'h-[45vh] min-h-[22rem] items-center justify-end min-[992px]:h-[55vh]'
            : 'min-h-screen items-start justify-center',
        )}
      >
        <div
          className={cn(
            'w-full',
            half ? cn('max-w-[720px]', searchPlaceholder && 'min-[768px]:w-fit') : 'max-w-[552px]',
            half
              ? cn(
                  'mb-16 text-center min-[992px]:mb-[10vh]',
                  searchPlaceholder && 'max-[991px]:mb-20',
                )
              : 'max-md:flex max-md:h-screen max-md:flex-col max-md:pt-[15vh]',
          )}
        >
          {logo && typeof logo === 'object' && (
            <Picture
              alt={logo.alt ?? ''}
              className="-ml-px mb-4 h-[25px] w-auto max-md:hidden"
              image={logo}
            />
          )}
          {richText && (
            <RichText
              className={cn(
                half
                  ? cn(
                      '!mx-auto',
                      // Blog and help center: the site's .display-2 (calc(1.575rem + 3.9vw), 4.5rem from 1200px), same on mobile.
                    )
                  : '!mx-0',
                // Half hero tagline (.hero.half .tagline): #ddd, weight 500.
                half && '[&_h6]:!font-medium [&_h6]:!text-[#ddd]',
                'w-full [&_h1]:mb-2 [&_h1]:text-[calc(1.525rem+3.3vw)] [&_h1]:font-semibold [&_h1]:leading-none min-[1200px]:[&_h1]:text-[4rem] [&_h6]:mb-2 [&_h6]:text-[calc(1.275rem+0.3vw)] [&_h6]:font-semibold min-[1200px]:[&_h6]:text-2xl [&_h6]:leading-none max-md:[&_h6]:text-base max-md:[&_h6]:font-medium max-md:[&_h6]:!font-[family-name:var(--font-sans)] [&_p]:m-0 [&_p]:mt-4 max-md:[&_p]:mt-6 [&_p]:font-light [&_p]:leading-normal',
                half &&
                  '[&_h1]:text-[calc(1.575rem+3.9vw)] [&_h1]:!leading-none min-[1200px]:[&_h1]:!text-[4.5rem]',
                onLight
                  ? '[&_h1]:text-black [&_h6]:text-black [&_p]:text-[#4b4b4b]'
                  : '[&_h1]:text-white [&_h6]:text-white [&_p]:text-[#ddd]',
              )}
              data={richText}
              enableGutter={false}
            />
          )}
          {cta && (
            <CMSLink
              {...cta}
              appearance={onLight ? 'default' : 'inverse'}
              className={cn(
                'my-8 max-md:mb-4 max-md:mt-auto md:w-fit',
                onLight && 'max-md:!bg-white max-md:!text-black',
              )}
              size="lg"
            >
              <ArrowRightIcon className={cn('size-[15px]', isAnchor && 'rotate-90')} />
            </CMSLink>
          )}
          {disclaimer && (
            <p
              className={cn(
                'm-0 text-xs font-normal leading-normal max-md:mb-8 max-md:text-center',
                onLight ? 'text-[#4b4b4b]' : 'text-[#bababa]',
              )}
            >
              {disclaimer}
              {disclaimerLink?.label && (
                <>
                  {' '}
                  <CMSLink
                    {...disclaimerLink}
                    appearance="inline"
                    className="font-medium underline"
                  />
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  )

  if (!searchPlaceholder) return hero

  // Help center: the search box sits on the lower edge of the hero, half over the next section.
  return (
    <div className="relative bg-[#f3f3f3] pb-9">
      {hero}
      <form
        action="/central-de-ajuda/busca"
        className="absolute inset-x-0 bottom-0 z-[3]"
        role="search"
      >
        <div className="container">
          <HelpSearch
            placeholder={searchPlaceholder}
            questionBase="/central-de-ajuda"
            searchPath="/central-de-ajuda/busca"
          />
        </div>
      </form>
    </div>
  )
}
