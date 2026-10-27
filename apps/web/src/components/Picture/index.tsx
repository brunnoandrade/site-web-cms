import type { Media } from '@digio/payload-types'

import { getImageProps } from 'next/image'

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
  /** Image of the first screen (probably the LCP): loads right away with high priority. */
  priority?: boolean
  /**
   * Display width, as in `<img sizes>`. Without it, images up to 640px wide get 1x/2x versions of
   * their own size and larger ones are sized for the whole viewport (`100vw`).
   */
  sizes?: string
  /** Width (px) from which the desktop image is used; the mobile one applies below it. */
  breakpoint?: number
}

type Data = { url: string; width?: number; height?: number }

const dataOf = (media: Image): Data | null =>
  typeof media === 'object' && media?.url
    ? { url: getMediaUrl(media.url, media.updatedAt), width: media.width ?? undefined, height: media.height ?? undefined }
    : null

// Vectors and animations are served as they are; so is anything whose size is unknown.
const canOptimize = (data: Data) => Boolean(data.width && data.height) && !/\.(svg|gif)(\?|$)/i.test(data.url)

const SMALL = 640

/** Optimized versions (WebP in several widths, through the Next.js image optimizer) of one image. */
const optimized = (data: Data, sizes?: string) => {
  if (!canOptimize(data)) return null
  const { props } = getImageProps({
    alt: '',
    height: data.height!,
    quality: 75,
    sizes: sizes ?? (data.width! > SMALL ? '100vw' : undefined),
    src: data.url,
    width: data.width!,
  })
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes }
}

/**
 * <picture> for CMS images (logos, badges, photos) with an optional mobile variant. Width and
 * height come from the media record, so the browser reserves the space before it loads, and the
 * files go through the Next.js image optimizer (smaller format and size) instead of being sent as
 * uploaded. Pass `alt=""` for decorative images.
 */
export const Picture = ({
  image,
  mobile,
  alt,
  className,
  loading = 'lazy',
  priority = false,
  sizes,
  breakpoint = 992,
}: Props) => {
  const desktop = dataOf(image)
  const small = dataOf(mobile)
  const main = desktop ?? small
  if (!main) return null

  const mainImage = optimized(main, sizes)
  const smallImage = small && desktop ? optimized(small, sizes) : null

  return (
    <picture>
      {small && desktop && (
        // width/height on the source: the variant's own proportion is reserved, not the desktop one's.
        <source
          height={small.height}
          media={`(max-width: ${breakpoint - 1}px)`}
          sizes={smallImage?.sizes}
          srcSet={smallImage?.srcSet ?? small.url}
          width={small.width}
        />
      )}
      <img
        alt={alt}
        className={className}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        height={main.height}
        loading={priority ? 'eager' : loading}
        sizes={mainImage?.sizes}
        src={mainImage?.src ?? main.url}
        srcSet={mainImage?.srcSet}
        width={main.width}
      />
    </picture>
  )
}
