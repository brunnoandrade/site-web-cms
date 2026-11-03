'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  /** Video for screens from 768px (also the fallback for mobile). */
  src: string
  /** Video for screens under 768px; falls back to `src`. */
  srcMobile?: string | null
  /** Width (px) from which `src` is used; below it `srcMobile` (default 768). */
  breakpoint?: number
  className?: string
  /** Proportion of the mobile video (`w / h`), to reserve its space before the file loads. */
  aspectMobile?: string
  /** Same for the desktop video, whose width follows its height. */
  aspectDesktop?: string
}

/**
 * Decorative background video (fades in over .5s, like the current site). The file follows the
 * screen width (md = 768px, same breakpoint as the hero layout) and only that one is downloaded.
 * The poster (first frame, optional) is a separate image behind it (see FullscreenHero): it paints
 * at once and the video fades in over it. A poster that differs from the video would flash, so it
 * must be that frame; without one the black hero shows until the first frame. With reduced motion it does not play
 * (it shows the first frame of the video). There is no pause button, like the current site.
 */
export const HeroVideo: React.FC<Props> = ({ src, srcMobile, breakpoint = 768, className, aspectMobile, aspectDesktop }) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const wide = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const load = () => {
      const file = wide.matches ? src : (srcMobile ?? src)
      // `#t=0.1` makes the browser paint a frame without playing (reduced motion).
      const next = reduced.matches ? `${file}#t=0.1` : file
      if (video.getAttribute('src') === next) return
      video.setAttribute('src', next)
      video.load()
      if (!reduced.matches) video.play().catch(() => undefined)
    }
    wide.addEventListener('change', load)
    load()
    return () => wide.removeEventListener('change', load)
  }, [src, srcMobile, breakpoint])

  return (
    <video
      aria-hidden
      className={cn(
        'opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] motion-reduce:animate-none motion-reduce:opacity-100',
        aspectMobile && 'max-md:[aspect-ratio:var(--video-aspect-mobile)]',
        aspectDesktop && 'md:[aspect-ratio:var(--video-aspect-desktop)]',
        className,
      )}
      loop
      muted
      playsInline
      preload="metadata"
      ref={ref}
      style={
        {
          '--video-aspect-mobile': aspectMobile,
          '--video-aspect-desktop': aspectDesktop,
        } as React.CSSProperties
      }
      tabIndex={-1}
    />
  )
}
