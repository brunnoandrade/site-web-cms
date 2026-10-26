'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { cn } from '@/utilities/ui'

type Props = {
  children: React.ReactNode[]
  /** Width of each item from 992px (a class such as `min-[992px]:w-[calc((100%-2rem)/3)]`). */
  itemClassName: string
  /** Round arrows under the strip: "light" on dark sections, "dark" on light ones. */
  tone?: 'light' | 'dark'
  /** Under 992px: swipe sideways (items 85% wide) instead of stacking. */
  mobileScroll?: boolean
  /** Item width under 992px when `mobileScroll` (default 85% of the strip). */
  mobileItemClassName?: string
  /** Gap between items (classes), default `gap-4`. */
  gapClassName?: string
  /**
   * Controls like the current site's "primary" swiper navigation: 45px round arrows (the first
   * disabled at the start) with one dot per scroll position between them; dots also on mobile.
   */
  primaryControls?: boolean
  /** With `primaryControls`: only the dots, without the round arrows. */
  dotsOnly?: boolean
  /** Advances one position every `autoplayMs` and rewinds at the end (pauses on hover, focus and reduced motion). */
  autoplayMs?: number
  /** Extra classes for the controls row (e.g. to center it under a wider block). */
  controlsClassName?: string
  /** Extra classes for the scrolling list (e.g. side padding before the first item). */
  listClassName?: string
  className?: string
}

/**
 * Horizontal strip of cards. From 992px the items sit in one row and scroll sideways (snap) with
 * round arrows; below it they stack. Without JavaScript it still scrolls with the mouse wheel
 * or touch.
 */
export const Strip: React.FC<Props> = ({
  children,
  itemClassName,
  tone = 'dark',
  mobileScroll,
  mobileItemClassName = 'w-[85%]',
  gapClassName = 'gap-4',
  primaryControls,
  dotsOnly,
  autoplayMs,
  controlsClassName,
  listClassName,
  className,
}) => {
  const ref = useRef<HTMLUListElement>(null)
  const items = React.Children.toArray(children)
  const [overflow, setOverflow] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 2)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [items.length])
  const scroll = (direction: 1 | -1) =>
    ref.current?.scrollBy({ left: direction * ref.current.clientWidth, behavior: 'smooth' })

  // Scroll position as "pages" (one dot per position), for the primary controls.
  const [state, setState] = useState({ index: 0, pages: 1, start: true, end: false })
  const update = useCallback(() => {
    const el = ref.current
    const slide = el?.firstElementChild as HTMLElement | null
    if (!el || !slide) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const step = slide.offsetWidth + gap || 1
    const max = el.scrollWidth - el.clientWidth
    const pages = Math.max(1, Math.ceil((max - 4) / step) + 1)
    const start = el.scrollLeft <= 4
    const end = el.scrollLeft >= max - 4
    const index = end ? pages - 1 : Math.min(pages - 1, Math.round(el.scrollLeft / step))
    setState({ index, pages, start, end })
  }, [])
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, items.length])
  const goTo = (index: number) => {
    const el = ref.current
    const slide = el?.firstElementChild as HTMLElement | null
    if (!el || !slide) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollTo({ left: index * (slide.offsetWidth + gap), behavior: 'smooth' })
  }

  // Autoplay: one position every `autoplayMs`, back to the start after the last one.
  const paused = useRef(false)
  const live = useRef({ state, goTo, overflow })
  live.current = { state, goTo, overflow }
  useEffect(() => {
    if (!autoplayMs || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      const { state: current, goTo: go, overflow: moves } = live.current
      if (paused.current || document.hidden || !moves) return
      go(current.end ? 0 : current.index + 1)
    }, autoplayMs)
    return () => window.clearInterval(id)
  }, [autoplayMs])

  const button = cn(
    'flex items-center justify-center rounded-full transition-colors motion-reduce:transition-none',
    primaryControls ? 'size-[45px]' : 'size-[2.75rem]',
    tone === 'dark'
      ? primaryControls
        ? 'bg-[#e8e8e8] text-black hover:enabled:bg-black hover:enabled:text-white disabled:cursor-not-allowed disabled:text-black/40'
        : 'bg-[#e8e8e8] text-black hover:bg-[#d6d6d6]'
      : primaryControls
        ? 'bg-white/25 text-white hover:enabled:bg-white hover:enabled:text-black disabled:cursor-not-allowed disabled:text-white/40'
        : 'bg-white/20 text-white hover:bg-white/30',
  )

  return (
    <div
      className={cn('min-w-0', className)}
      onBlur={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <ul
        onScroll={primaryControls ? update : undefined}
        ref={ref}
        className={cn(
          'm-0 flex list-none snap-x snap-mandatory overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          gapClassName,
          !mobileScroll && 'max-[991px]:flex-col max-[991px]:overflow-visible',
          listClassName,
        )}
      >
        {items.map((child, i) => (
          <li
            key={i}
            className={cn(
              'snap-start min-[992px]:shrink-0',
              mobileScroll ? cn(mobileItemClassName, 'shrink-0 min-[992px]:w-auto') : '',
              itemClassName,
            )}
          >
            {child}
          </li>
        ))}
      </ul>
      {primaryControls ? (
        <div
          className={cn(
            'mt-10 flex items-center justify-center gap-4 max-[767px]:mt-7',
            !overflow && 'min-[992px]:hidden',
            controlsClassName,
          )}
        >
          {!dotsOnly && (
            <button
              aria-label="Anterior"
              className={cn(button, 'max-[991px]:hidden')}
              disabled={state.start}
              onClick={() => goTo(Math.max(0, state.index - 1))}
              type="button"
            >
              <ArrowRightIcon className="w-[18px] rotate-180" />
            </button>
          )}
          <div aria-hidden className="flex items-center gap-2">
            {Array.from({ length: state.pages }, (_, i) => (
              <button
                key={i}
                className={cn(
                  'h-2 rounded-[5px] transition-all duration-200 motion-reduce:transition-none',
                  i === state.index
                    ? cn('w-[30px]', tone === 'dark' ? 'bg-black' : 'bg-white')
                    : cn(
                        'w-2',
                        tone === 'dark'
                          ? 'bg-[#e8e8e8] hover:bg-black'
                          : 'bg-white/20 hover:bg-white',
                      ),
                )}
                onClick={() => goTo(i)}
                tabIndex={-1}
                type="button"
              />
            ))}
          </div>
          {!dotsOnly && (
            <button
              aria-label="Próximo"
              className={cn(button, 'max-[991px]:hidden')}
              disabled={state.end}
              onClick={() => goTo(Math.min(state.pages - 1, state.index + 1))}
              type="button"
            >
              <ArrowRightIcon className="w-[18px]" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'mt-12 flex justify-center gap-2 max-[991px]:hidden',
            !overflow && 'min-[992px]:hidden',
          )}
        >
          <button aria-label="Anterior" className={button} onClick={() => scroll(-1)} type="button">
            <ArrowLeft aria-hidden className="size-5" />
          </button>
          <button aria-label="Próximo" className={button} onClick={() => scroll(1)} type="button">
            <ArrowRight aria-hidden className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}
