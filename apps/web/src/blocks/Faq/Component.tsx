import { Plus } from 'lucide-react'
import React from 'react'

import type { FaqBlock as FaqBlockProps } from '@digio/payload-types'

import { ArrowUpRightIcon } from '@/components/ArrowUpRightIcon'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { Section, SectionHeading, isDarkTheme } from '@/components/Section'
import { cn } from '@/utilities/ui'

/**
 * Two columns: title (and "see more" link) on the left, questions on the right. Native
 * <details>/<summary>: keyboard and screen reader support without JavaScript.
 */
export const FaqBlock: React.FC<FaqBlockProps> = ({
  theme,
  variant,
  heading,
  faqs,
  enableMoreLink,
  moreLink,
}) => {
  const items = (faqs ?? []).filter((faq) => typeof faq === 'object')
  if (items.length === 0) return null
  const dark = isDarkTheme(theme)

  // Uber Conta: cards on a grey background, one open at a time (the first starts open).
  if (variant === 'cards') {
    const group = `faq-${items[0].id}`
    return (
      <Section theme={theme}>
        <div className="container grid gap-8 min-[992px]:grid-cols-12 min-[992px]:gap-0">
          <div className="min-[992px]:col-span-4">
            <SectionHeading>{heading || 'Perguntas frequentes'}</SectionHeading>
          </div>
          <div className="min-[992px]:col-span-7 min-[992px]:col-start-6">
            <div className="mb-8">
              {items.map((faq, i) => (
                <details
                  key={faq.id}
                  className="group mb-4 rounded-[0.375rem] bg-[#f3f3f3]"
                  data-slot="faq-item"
                  name={group}
                  open={i === 0}
                >
                  <summary className="flex list-none items-center justify-between gap-4 px-5 py-4 text-black transition-[padding] duration-200 motion-reduce:transition-none group-[:not([open])]:min-[992px]:hover:pl-[1.6875rem] [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      aria-hidden
                      className="rotate-45 font-medium transition-transform group-open:rotate-0 motion-reduce:transition-none"
                    >
                      ✕
                    </span>
                  </summary>
                  <RichText
                    className="px-5 pb-4 font-light text-[#4b4b4b] [&_li]:m-0 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:mt-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold [&_strong]:text-black"
                    data={faq.answer}
                    enableGutter={false}
                  />
                </details>
              ))}
            </div>
            {enableMoreLink && moreLink && (
              <div data-slot="faq-more">
                <CMSLink
                  {...moreLink}
                  appearance="inline"
                  className="link-underline text-[#276ef1]"
                >
                  <ArrowUpRightIcon className="-mt-[3px] ml-2 inline align-middle" />
                </CMSLink>
              </div>
            )}
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section theme={theme}>
      <div className="container grid gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
        <div>
          <SectionHeading>{heading || 'Perguntas frequentes'}</SectionHeading>
          {enableMoreLink && moreLink && (
            <div className="mt-8" data-slot="faq-more">
              <CMSLink {...moreLink} appearance={dark ? 'inverse' : 'default'} />
            </div>
          )}
        </div>
        <div
          className={cn(
            'divide-y border-y',
            dark ? 'divide-white/20 border-white/20' : 'divide-[#dde1f3] border-[#dde1f3]',
          )}
        >
          {items.map((faq) => (
            <details key={faq.id} className="group" data-slot="faq-item">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-[var(--weight-faq,600)] [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus
                  aria-hidden
                  className="size-5 shrink-0 transition-transform group-open:rotate-45"
                />
              </summary>
              <RichText
                className={cn(
                  'pb-5 font-[var(--weight-support,400)]',
                  dark ? 'text-white/85' : 'text-ink-600',
                )}
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
