import React from 'react'

import type { Page } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

/**
 * Digio hero (Uber Conta pattern): navy full-width band that runs under the floating header,
 * large title, calls to action (white, then outline), image and a small legal note.
 */
export const BrandHero: React.FC<Page['hero']> = ({ links, media, richText, disclaimer }) => (
  <section className="-mt-24 bg-navy-900 pt-28 text-white md:pt-32" data-section-theme="navy">
    <div className="container grid items-center gap-10 pb-12 md:grid-cols-2 md:gap-16 md:pb-20">
      <div>
        {richText && (
          <RichText
            className="[&_h1]:text-[2.5rem] [&_h1]:font-semibold [&_h1]:leading-[1.05] [&_h1]:tracking-tight md:[&_h1]:text-display [&_p]:text-lg [&_p]:text-white/85"
            data={richText}
            enableGutter={false}
          />
        )}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="mt-8 flex flex-col gap-3 sm:flex-row">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink
                  {...link}
                  appearance={i === 0 ? 'inverse' : 'outline'}
                  className="w-full sm:w-auto"
                  size="lg"
                />
              </li>
            ))}
          </ul>
        )}

        {disclaimer && <p className="mt-6 max-w-md text-xs leading-relaxed text-white/70">{disclaimer}</p>}
      </div>

      {media && typeof media === 'object' && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-card md:aspect-square">
          <Media fill imgClassName="object-cover" priority resource={media} />
        </div>
      )}
    </div>
  </section>
)
