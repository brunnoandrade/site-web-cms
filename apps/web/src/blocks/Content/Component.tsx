import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { Section, isDarkTheme } from '@/components/Section'

const colsSpanClasses = {
  full: 'lg:col-span-12',
  half: 'lg:col-span-6',
  oneThird: 'lg:col-span-4',
  twoThirds: 'lg:col-span-8',
}

export const ContentBlock: React.FC<ContentBlockProps> = ({ theme, columns }) => {
  if (!columns?.length) return null
  const dark = isDarkTheme(theme)

  return (
    <Section theme={theme}>
      <div className="container grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12">
        {columns.map((col, index) => {
          const { enableLink, link, richText, size } = col
          return (
            <div
              className={cn('col-span-4', colsSpanClasses[size ?? 'oneThird'], size !== 'full' && 'md:col-span-2')}
              key={index}
            >
              {richText && <RichText data={richText} enableGutter={false} />}
              {enableLink && link && (
                <CMSLink {...link} appearance={dark ? 'inverse' : link.appearance} className="mt-6" />
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
