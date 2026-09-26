import { ArrowRight, ArrowUpRight } from 'lucide-react'
import React from 'react'

import type { CardsBlock as CardsBlockProps } from '@digio/payload-types'

import { Icon } from '@/components/Icon'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Section, SectionHeading, isDarkTheme } from '@/components/Section'
import { cn } from '@/utilities/ui'

type Item = NonNullable<CardsBlockProps['items']>[number]

const gridColumns = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-3', '4': 'md:grid-cols-2 lg:grid-cols-4' }

const featureColors: Record<NonNullable<Item['background']>, string> = {
  navy: 'bg-navy-900 text-white',
  blue: 'bg-brand-blue text-white',
  lilac: 'bg-lilac-100 text-navy-900',
  white: 'bg-white text-navy-900 border border-[#dde1f3]',
}

/** Wraps the card in its link (the whole card is clickable, one link per card). */
const CardLink: React.FC<{ item: Item; className: string; children: React.ReactNode }> = ({ item, className, children }) =>
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
      {item.text && <p className="mt-2 text-sm opacity-85">{item.text}</p>}
    </div>
    {item.image && typeof item.image === 'object' && (
      <div className="relative mt-auto aspect-[4/3]">
        <Media fill imgClassName="object-cover" resource={item.image} />
      </div>
    )}
  </CardLink>
)

const ProductCard: React.FC<{ item: Item }> = ({ item }) => (
  <div className="relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-card bg-white p-6 text-navy-900 md:p-8">
    <h3 className="text-2xl font-semibold">{item.title}</h3>
    {item.text && <p className="mt-2 max-w-xs text-sm text-ink-600">{item.text}</p>}
    {item.image && typeof item.image === 'object' && (
      <div className="absolute bottom-4 right-4 size-28 overflow-hidden rounded-card md:size-36">
        <Media fill imgClassName="object-cover" resource={item.image} />
      </div>
    )}
    {item.enableLink && item.link && (
      <CMSLink
        {...item.link}
        appearance="inline"
        className="mt-auto inline-flex items-center gap-1 pt-8 text-sm font-semibold text-brand-blue after:absolute after:inset-0 hover:underline"
        label={null}
      >
        {item.link.label || 'Conhecer'} <ArrowRight aria-hidden className="size-4" />
      </CMSLink>
    )}
  </div>
)

const IconCard: React.FC<{ item: Item; dark: boolean }> = ({ item, dark }) => (
  <CardLink
    className={cn(
      'flex h-full flex-col rounded-card p-4 transition-colors md:p-6',
      dark ? 'bg-navy-800 hover:bg-navy-700' : 'bg-lilac-50 hover:bg-lilac-100',
    )}
    item={item}
  >
    <div className="mb-6 flex items-start justify-between md:mb-8">
      <Icon className={cn('size-7', dark ? 'text-turquoise-400' : 'text-brand-blue')} name={item.icon ?? undefined} />
      {item.enableLink && <ArrowUpRight aria-hidden className="size-5 opacity-80" />}
    </div>
    <h3 className="font-semibold md:text-lg">{item.title}</h3>
    {item.text && <p className="mt-1 text-sm opacity-80">{item.text}</p>}
  </CardLink>
)

const SimpleCard: React.FC<{ item: Item }> = ({ item }) => (
  <CardLink className="flex h-full flex-col gap-3 rounded-card border border-[#dde1f3] bg-white p-6 text-navy-900" item={item}>
    {item.image && typeof item.image === 'object' && <Media imgClassName="rounded-card" resource={item.image} />}
    <h3 className="text-xl font-semibold">{item.title}</h3>
    {item.text && <p className="text-ink-600">{item.text}</p>}
  </CardLink>
)

export const CardsBlock: React.FC<CardsBlockProps> = ({
  variant,
  theme,
  heading,
  intro,
  columns,
  items,
  enableSectionLink,
  sectionLink,
}) => {
  if (!items?.length) return null
  const dark = isDarkTheme(theme)
  // Solutions (icon cards) put the heading on the left, like the reference layout.
  const headingLeft = variant === 'icon'

  return (
    <Section theme={theme}>
      <div className="container">
        {(heading || intro) && (
          <div className={cn('mb-10 md:mb-12', headingLeft ? 'max-w-xl' : 'mx-auto max-w-3xl text-center')}>
            {heading && <SectionHeading>{heading}</SectionHeading>}
            {intro && <p className={cn('mt-3 text-lg', dark ? 'text-white/80' : 'text-ink-600')}>{intro}</p>}
            {enableSectionLink && sectionLink && (
              <CMSLink {...sectionLink} appearance={dark ? 'inverse' : 'default'} className="mt-6" />
            )}
          </div>
        )}

        <ul
          className={cn(
            'grid gap-4 md:gap-6',
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
