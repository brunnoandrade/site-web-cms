import React from 'react'

import type { TestimonialsBlock as TestimonialsBlockProps } from '@digio/payload-types'

import { Section, SectionHeading, isDarkTheme } from '@/components/Section'
import { cn } from '@/utilities/ui'

import { Carousel } from './Carousel'

/** Text between **double asterisks** is highlighted (turquoise on dark backgrounds). */
const Quote: React.FC<{ text: string; dark: boolean }> = ({ text, dark }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong
          key={i}
          className={cn('font-semibold', dark ? 'text-turquoise-400' : 'text-brand-blue')}
          data-slot="quote-highlight"
        >
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
)

/** Avatar text: the author as is when short ("Ed"), else the first letters of the first and last names. */
const initials = (author: string) => {
  const words = author.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2)
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({ theme, heading, items }) => {
  if (!items?.length) return null
  const dark = isDarkTheme(theme ?? 'blue')

  return (
    <Section theme={theme ?? 'blue'}>
      <div className="container">
        <Carousel heading={<SectionHeading className="text-left">{heading}</SectionHeading>} label={heading}>
          {items.map((item, i) => (
            <figure
              key={item.id ?? i}
              aria-label={`${i + 1} de ${items.length}`}
              aria-roledescription="slide"
              className={cn(
                'flex h-full min-h-[300px] flex-col items-start rounded-2xl p-6',
                dark ? 'bg-white/10' : 'bg-lilac-50',
              )}
              role="group"
            >
              <span
                aria-hidden
                className="flex size-[35px] items-center justify-center rounded-full bg-black text-[0.8em] font-light text-white"
                data-slot="testimonial-avatar"
              >
                {initials(item.author)}
              </span>
              <blockquote
                className="my-auto text-base font-medium leading-[1.3] min-[1200px]:text-2xl"
                data-slot="testimonial-quote"
              >
                <p className="mb-0">
                  “<Quote dark={dark} text={item.quote} />”
                </p>
              </blockquote>
              <figcaption className="sr-only">
                {item.author}
                {item.detail ? `, ${item.detail}` : ''}
              </figcaption>
            </figure>
          ))}
        </Carousel>
      </div>
    </Section>
  )
}
