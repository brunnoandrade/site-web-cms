import type { Media } from '@digio/payload-types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

type Image = Media | number | null | undefined

type Props = {
  /** Image shown on desktop (and everywhere when `mobile` is not set). */
  image?: Image
  /** Optional variant for screens narrower than `breakpoint`. */
  mobile?: Image
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  /** Width (px) from which the desktop image is used; the mobile one applies below it. */
  breakpoint?: number
}

const dataOf = (media: Image) =>
  typeof media === 'object' && media?.url
    ? { url: getMediaUrl(media.url, media.updatedAt), width: media.width ?? undefined, height: media.height ?? undefined }
    : null

/**
 * Plain <picture> for CMS images (logos, badges, photos) with an optional mobile variant. Width
 * and height come from the media record, so the browser reserves the space before it loads.
 * Pass `alt=""` for decorative images.
 */
export const Picture = ({ image, mobile, alt, className, loading = 'lazy', breakpoint = 992 }: Props) => {
  const desktop = dataOf(image)
  const small = dataOf(mobile)
  const main = desktop ?? small
  if (!main) return null

  return (
    <picture>
      {small && desktop && <source media={`(max-width: ${breakpoint - 1}px)`} srcSet={small.url} />}
      <img
        alt={alt}
        className={className}
        decoding="async"
        height={main.height}
        loading={loading}
        src={main.url}
        width={main.width}
      />
    </picture>
  )
}
