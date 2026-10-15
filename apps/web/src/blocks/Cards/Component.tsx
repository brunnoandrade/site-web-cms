import { ArrowRight, ArrowUpRight } from 'lucide-react'
import React from 'react'

import type { CardsBlock as CardsBlockProps } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Icon } from '@/components/Icon'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Picture } from '@/components/Picture'
import { Section, SectionHeading, isDarkTheme } from '@/components/Section'
import { HeroVideo } from '@/heros/FullscreenHero/HeroVideo'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

type Item = NonNullable<CardsBlockProps['items']>[number]

const gridColumns = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

const featureColors: Record<NonNullable<Item['background']>, string> = {
  navy: 'bg-navy-900 text-white',
  blue: 'bg-brand-blue text-white',
  lilac: 'bg-lilac-100 text-navy-900',
  white: 'bg-white text-navy-900 border border-[#dde1f3]',
}

/** Wraps the card in its link (the whole card is clickable, one link per card). */
const CardLink: React.FC<{ item: Item; className: string; children: React.ReactNode }> = ({
  item,
  className,
  children,
}) =>
  item.enableLink && item.link ? (
    <CMSLink {...item.link} appearance="inline" className={cn('block', className)} label={null}>
      {children}
    </CMSLink>
  ) : (
    <div className={className}>{children}</div>
  )

const FeatureCard: React.FC<{ item: Item }> = ({ item }) => (
  <CardLink
    className={cn(
      'flex h-full min-h-[26rem] flex-col overflow-hidden rounded-card transition-transform hover:-translate-y-1',
      featureColors[item.background ?? 'navy'],
    )}
    item={item}
  >
    <div className="p-6 md:p-8">
      <h3 className="text-2xl font-semibold leading-tight">{item.title}</h3>
      {item.text && (
        <p className="mt-2 text-sm font-[var(--weight-support,400)] opacity-85">{item.text}</p>
      )}
    </div>
    {item.image && typeof item.image === 'object' && (
      <div className="relative mt-auto aspect-[4/3]">
        <Media fill imgClassName="object-cover" resource={item.image} />
      </div>
    )}
  </CardLink>
)

/**
 * Uber Conta lending card, like the current site: white card (350px tall from 768px) with title,
 * text and a blue "Conhecer" link at the bottom. The image sits small above the title on mobile and
 * at the bottom-right corner from 768px, where it grows on hover. The whole card is the link.
 */
const ProductCard: React.FC<{ item: Item }> = ({ item }) => (
  <CardLink
    className="group relative flex h-full flex-col items-start rounded-2xl bg-white p-6 font-light text-black md:h-[350px]"
    item={item}
  >
    <Picture
      alt=""
      className="-ml-2 mb-4 block max-w-20 transition-transform duration-200 motion-reduce:transition-none md:absolute md:bottom-9 md:right-9 md:mb-0 md:ml-0 md:w-auto md:max-w-none md:group-hover:scale-[1.16]"
      image={item.image}
    />
    <h3 className="relative z-[5] text-[min(2rem,calc(1.325rem+0.9vw))] font-semibold leading-none max-md:text-[1.35rem]">
      {item.title}
    </h3>
    {item.text && (
      <p className="relative z-[5] mb-0 mt-2 text-base font-light text-[#4b4b4b]">
        <Lines hideBelow="max-[991px]:hidden" text={item.text} />
      </p>
    )}
    {item.enableLink && item.link && (
      <span className="relative z-[5] mt-4 inline-flex items-center font-normal text-brand-blue md:mt-auto">
        <span className="relative">
          {item.link.label || 'Conhecer'}
          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-current transition-all duration-200 group-hover:w-full motion-reduce:transition-none" />
        </span>
        <ArrowRightIcon className="-mt-0.5 ml-2 w-[18px] transition-all duration-200" />
      </span>
    )}
  </CardLink>
)

const IconCard: React.FC<{ item: Item; dark: boolean }> = ({ item, dark }) => (
  <CardLink
    className={cn(
      'flex h-full flex-col p-4 transition-colors md:p-6',
      dark && item.image ? 'rounded-[0.5rem]' : 'rounded-card',
      dark ? 'bg-navy-800 hover:bg-navy-700' : 'bg-lilac-50 hover:bg-lilac-100',
      dark &&
        item.image &&
        'bg-[rgba(94,94,94,0.2)] text-white hover:bg-white hover:text-black motion-reduce:transition-none',
    )}
    item={item}
  >
    <div className="mb-6 flex items-start justify-between md:mb-8">
      {item.image ? (
        <Picture alt="" className="size-10" image={item.image} />
      ) : (
        <Icon
          className={cn('size-7', dark ? 'text-turquoise-400' : 'text-brand-blue')}
          name={item.icon ?? undefined}
        />
      )}
      {item.enableLink &&
        (item.image ? (
          <ArrowRightIcon className="w-5" />
        ) : (
          <ArrowUpRight aria-hidden className="size-5 opacity-80" />
        ))}
    </div>
    <h3 className="font-semibold md:text-lg" data-slot="icon-card-title">
      {item.title}
    </h3>
    {item.text && (
      <p
        className="mt-1 text-sm font-[var(--weight-support,400)] opacity-80"
        data-slot="icon-card-text"
      >
        {item.text}
      </p>
    )}
  </CardLink>
)

const SimpleCard: React.FC<{ item: Item }> = ({ item }) => (
  <CardLink
    className="flex h-full flex-col gap-3 rounded-card border border-[#dde1f3] bg-white p-6 text-navy-900"
    item={item}
  >
    {item.image && typeof item.image === 'object' && (
      <Media imgClassName="rounded-card" resource={item.image} />
    )}
    <h3 className="text-xl font-semibold">{item.title}</h3>
    {item.text && <p className="font-[var(--weight-support,400)] text-ink-600">{item.text}</p>}
  </CardLink>
)

/** Text with line breaks from the CMS; `hideBelow` is the class that hides the break on small screens. */
const Lines: React.FC<{ text: string; hideBelow: string }> = ({ text, hideBelow }) => {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br className={hideBelow} />}
          {line}
          {i < lines.length - 1 && ' '}
        </React.Fragment>
      ))}
    </>
  )
}

const shortcutColors: Record<NonNullable<Item['background']>, { box: string; text: string }> = {
  navy: { box: 'bg-navy-900', text: 'text-white' },
  blue: { box: 'bg-brand-blue', text: 'text-white' },
  lilac: { box: 'bg-lilac-100', text: 'text-black' },
  white: { box: 'bg-white', text: 'text-black' },
}

/**
 * Uber Conta shortcut: a card with the text at the top and a photo behind it (top-aligned on
 * tablet, bottom-aligned on mobile and from 992px, so photos of different proportions line up). The round arrow slides up on hover from 992px and is always visible below.
 * Heights follow the current site: 350px, then 450 / 540 / 635px from 992 / 1200 / 1400px.
 */
const ShortcutCard: React.FC<{ item: Item }> = ({ item }) => {
  const colors = shortcutColors[item.background ?? 'navy']
  const light = colors.text === 'text-white'

  return (
    <CardLink
      className={cn(
        'group relative block h-[350px] overflow-hidden rounded-2xl p-6 font-light min-[992px]:h-[450px] min-[1200px]:h-[540px] min-[1400px]:h-[635px]',
        colors.box,
        colors.text,
      )}
      item={item}
    >
      <h3 className="relative z-[5] text-[min(2rem,calc(1.325rem+0.9vw))] font-semibold leading-none max-md:text-[1.35rem]">
        <Lines hideBelow="max-md:hidden" text={item.title} />
      </h3>
      {item.text && (
        <p
          className={cn(
            'relative z-[5] mb-0 mt-2 text-base font-light',
            light ? 'text-white' : 'text-[#4b4b4b]',
          )}
        >
          <Lines hideBelow="max-[991px]:hidden" text={item.text} />
        </p>
      )}
      <Picture
        alt=""
        breakpoint={768}
        className="absolute left-0 top-0 z-0 h-auto w-full transition-transform duration-200 group-hover:scale-[1.16] motion-reduce:transition-none max-md:bottom-0 max-md:top-auto min-[992px]:bottom-0 min-[992px]:top-auto"
        image={item.image}
        mobile={item.imageMobile}
      />
      {item.enableLink && (
        <span
          aria-hidden
          className={cn(
            'absolute bottom-6 right-6 z-[5] flex size-[55px] items-center justify-center rounded-full transition-all duration-200 motion-reduce:transition-none min-[992px]:translate-y-[100px] group-hover:translate-y-0 group-focus-visible:translate-y-0',
            'text-white hover:!bg-white hover:!text-black',
            light ? 'bg-white/25' : 'bg-black',
          )}
        >
          <ArrowRightIcon />
        </span>
      )}
    </CardLink>
  )
}

const shortcutColumns = {
  '2': 'min-[992px]:grid-cols-2',
  '3': 'min-[992px]:grid-cols-3',
  '4': 'min-[992px]:grid-cols-4',
}

export const CardsBlock: React.FC<CardsBlockProps> = ({
  variant,
  theme,
  heading,
  intro,
  video,
  columns,
  items,
  enableSectionLink,
  sectionLink,
}) => {
  if (!items?.length) return null
  const dark = isDarkTheme(theme)

  if (variant === 'shortcut') {
    return (
      <Section theme={theme}>
        <div className="container">
          {(heading || intro) && (
            <div className="text-left min-[992px]:text-center">
              {heading && <SectionHeading>{heading}</SectionHeading>}
              {intro && (
                <p
                  className={cn(
                    'mb-0 mt-4 text-base font-light',
                    dark ? 'text-white/80' : 'text-[#4b4b4b]',
                  )}
                >
                  {intro}
                </p>
              )}
            </div>
          )}
          <ul
            className={cn(
              'mt-8 grid grid-cols-1 gap-x-6 gap-y-3 min-[768px]:grid-cols-2 min-[768px]:gap-y-6 min-[992px]:mt-16',
              shortcutColumns[columns ?? '3'],
            )}
          >
            {items.map((item, i) => (
              <li key={item.id ?? i}>
                <ShortcutCard item={item} />
              </li>
            ))}
          </ul>
        </div>
      </Section>
    )
  }
  // Solutions (icon cards) put the heading on the left, like the reference layout.
  const headingLeft = variant === 'icon'
  // Lending cards: heading left on mobile and centered from 992px, extra vertical room, 24px x 12px gaps.
  const product = variant === 'product'

  const videoSrc =
    variant === 'icon' && typeof video === 'object' && video?.url
      ? getMediaUrl(video.url, video.updatedAt)
      : null

  return (
    <Section className={cn(videoSrc && 'overflow-hidden')} theme={theme}>
      <div className={cn('container', product && 'min-[992px]:py-8')}>
        {(heading || intro) && (
          <div
            className={cn(
              videoSrc && 'relative flex min-h-[22rem] items-center md:min-h-[26rem]',
              product
                ? 'mb-8 text-left min-[992px]:mb-16 min-[992px]:text-center'
                : 'mb-10 md:mb-12',
              !product && !videoSrc && (headingLeft ? 'max-w-xl' : 'mx-auto max-w-3xl text-center'),
            )}
          >
            {videoSrc && (
              <HeroVideo
                className="absolute inset-y-0 right-0 z-0 h-full w-auto max-w-none object-contain object-right max-md:-right-16 md:right-0"
                src={videoSrc}
              />
            )}
            <div className={cn(videoSrc && 'relative z-[1] max-w-xl')}>
              {heading && <SectionHeading>{heading}</SectionHeading>}
              {intro && (
                <p
                  className={cn(
                    'mt-3 text-lg font-[var(--weight-support,400)]',
                    dark ? 'text-white/80' : 'text-ink-600',
                  )}
                >
                  {intro}
                </p>
              )}
              {enableSectionLink && sectionLink && (
                <CMSLink
                  {...sectionLink}
                  appearance={dark ? 'inverse' : 'default'}
                  className="mt-6"
                >
                  <ArrowRightIcon className="size-[15px]" />
                </CMSLink>
              )}
            </div>
          </div>
        )}

        <ul
          id={videoSrc ? 'solucoes-lista' : undefined}
          className={cn(
            'grid',
            product ? 'gap-x-6 gap-y-3' : 'gap-4 md:gap-6',
            variant === 'icon' ? 'grid-cols-2' : 'grid-cols-1',
            gridColumns[columns ?? '3'],
          )}
        >
          {items.map((item, i) => (
            <li key={item.id ?? i}>
              {variant === 'feature' && <FeatureCard item={item} />}
              {variant === 'product' && <ProductCard item={item} />}
              {variant === 'icon' && <IconCard dark={dark} item={item} />}
              {(!variant || variant === 'simple') && <SimpleCard item={item} />}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
