import React from 'react'

import type { BannerSectionBlock as BannerSectionBlockProps } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

/**
 * Shows the banner only while active and inside its display window. The window is checked when
 * the page is rendered; pages are cached (ISR), so a banner may start or end a bit later than set.
 */
export const isBannerVisible = (
  banner: { active?: boolean | null; startsAt?: string | null; endsAt?: string | null },
  now = new Date(),
) => {
  if (!banner.active) return false
  if (banner.startsAt && new Date(banner.startsAt) > now) return false
  if (banner.endsAt && new Date(banner.endsAt) <= now) return false
  return true
}

export const BannerSectionBlock: React.FC<BannerSectionBlockProps> = ({ banner }) => {
  if (!banner || typeof banner !== 'object' || !isBannerVisible(banner)) return null
  if (typeof banner.image !== 'object') return null

  const image = (
    <div>
      {banner.mobileImage && typeof banner.mobileImage === 'object' && (
        <Media
          resource={banner.mobileImage}
          alt={banner.alt}
          className="md:hidden"
          imgClassName="w-full rounded"
        />
      )}
      <Media
        resource={banner.image}
        alt={banner.alt}
        className={banner.mobileImage ? 'hidden md:block' : undefined}
        imgClassName="w-full rounded"
      />
    </div>
  )

  return (
    <section className="container">
      {banner.enableLink && (banner.link?.url || banner.link?.reference) ? (
        <CMSLink {...banner.link} label={null} appearance="inline">
          {image}
        </CMSLink>
      ) : (
        image
      )}
    </section>
  )
}
