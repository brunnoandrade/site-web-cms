import { Plus } from 'lucide-react'
import React from 'react'

import type { FaqBlock as FaqBlockProps } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { Section, SectionHeading, isDarkTheme } from '@/components/Section'
import { cn } from '@/utilities/ui'

/**
 * Two columns: title (and "see more" link) on the left, questions on the right. Native
 * <details>/<summary>: keyboard and screen reader support without JavaScript.
 */
export const FaqBlock: React.FC<FaqBlockProps> = ({ theme, heading, faqs, enableMoreLink, moreLink }) => {
  const items = (faqs ?? []).filter((faq) => typeof faq === 'object')
  if (items.length === 0) return null
  const dark = isDarkTheme(theme)

  return (
    <Section theme={theme}>
      <div className="container grid gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
        <div>
          <SectionHeading>{heading || 'Perguntas frequentes'}</SectionHeading>
          {enableMoreLink && moreLink && (
            <CMSLink {...moreLink} appearance={dark ? 'inverse' : 'default'} className="mt-8" />
          )}
        </div>
        <div className={cn('divide-y border-y', dark ? 'divide-white/20 border-white/20' : 'divide-[#dde1f3] border-[#dde1f3]')}>
          {items.map((faq) => (
            <details key={faq.id} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <RichText
                className={cn('pb-5', dark ? 'text-white/85' : 'text-ink-600')}
                data={faq.answer}
                enableGutter={false}
              />
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
