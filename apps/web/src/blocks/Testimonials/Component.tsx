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
        <strong key={i} className={cn('font-semibold', dark ? 'text-turquoise-400' : 'text-brand-blue')}>
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
)

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({ theme, heading, items }) => {
  if (!items?.length) return null
  const dark = isDarkTheme(theme ?? 'blue')

  return (
    <Section theme={theme ?? 'blue'}>
      <div className="container">
        <Carousel
          heading={<SectionHeading className="max-w-2xl">{heading}</SectionHeading>}
          label={heading}
        >
          {items.map((item, i) => (
            <figure
              key={item.id ?? i}
              aria-label={`${i + 1} de ${items.length}`}
              aria-roledescription="slide"
              className={cn(
                'flex h-full flex-col justify-between rounded-card p-6 md:p-8',
                dark ? 'bg-white/10' : 'bg-lilac-50',
              )}
              role="group"
            >
              <blockquote className="text-lg leading-relaxed">
                <p>
                  “<Quote dark={dark} text={item.quote} />”
                </p>
              </blockquote>
              <figcaption className="mt-8">
                <span className="block font-semibold">{item.author}</span>
                {item.detail && <span className="block text-sm opacity-80">{item.detail}</span>}
              </figcaption>
            </figure>
          ))}
        </Carousel>
      </div>
    </Section>
  )
}
