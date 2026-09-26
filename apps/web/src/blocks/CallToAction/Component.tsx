import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { Section, isDarkTheme } from '@/components/Section'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ theme, links, richText }) => {
  const dark = isDarkTheme(theme)

  return (
    <Section theme={theme}>
      <div className="container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {richText && (
          <RichText
            className="ms-0 max-w-3xl text-left [&_h2]:text-3xl [&_h2]:md:text-title [&_p]:text-lg"
            data={richText}
            enableGutter={false}
          />
        )}
        {links && links.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            {links.map(({ link }, i) => {
              // On dark backgrounds the primary button turns white, the others outlined.
              const appearance = dark ? (i === 0 ? 'inverse' : 'outline') : link.appearance
              return <CMSLink key={i} size="lg" {...link} appearance={appearance} />
            })}
          </div>
        )}
      </div>
    </Section>
  )
}
