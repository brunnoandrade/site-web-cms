import type { Media } from '@digio/payload-types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

type Props = {
  /** Image shown on desktop (and everywhere when `mobile` is not set). */
  image?: Media | number | null
  /** Optional variant for screens under 992px. */
  mobile?: Media | number | null
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

const urlOf = (media?: Media | number | null) =>
  typeof media === 'object' && media?.url ? getMediaUrl(media.url, media.updatedAt) : null

/** Plain <picture> for CMS images (logos, badges), which are SVG/PNG and need no optimizer. */
export const Picture = ({ image, mobile, alt, className, loading = 'lazy' }: Props) => {
  const desktop = urlOf(image)
  const small = urlOf(mobile)
  const src = desktop ?? small
  if (!src) return null

  return (
    <picture>
      {small && desktop && <source media="(max-width: 991px)" srcSet={small} />}
      <img alt={alt} className={className} decoding="async" loading={loading} src={small && !desktop ? small : desktop ?? src} />
    </picture>
  )
}
