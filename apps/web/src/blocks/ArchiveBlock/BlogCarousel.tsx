'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { cn } from '@/utilities/ui'

/** Gap between slides (px). */
const GAP = 20

/**
 * Scroll-snap carousel of post cards (Uber Conta blog): native scrolling for touch, trackpad and
 * keyboard, plus round buttons (from 992px) and a dot indicator under it. No autoplay (WCAG 2.2.2).
 */
export const BlogCarousel: React.FC<{ label: string; children: React.ReactNode[] }> = ({
  label,
  children,
}) => {
  const track = useRef<HTMLUListElement>(null)
  const [state, setState] = useState({ index: 0, pages: 1, start: true, end: false })

  const step = useCallback(() => {
    const slide = track.current?.firstElementChild as HTMLElement | null
    return slide ? slide.offsetWidth + GAP : 1
  }, [])

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pages = Math.max(1, Math.ceil((max - 4) / step()) + 1)
    const start = el.scrollLeft <= 4
    const end = el.scrollLeft >= max - 4
    const index = end ? pages - 1 : Math.min(pages - 1, Math.round(el.scrollLeft / step()))
    setState({ index, pages, start, end })
  }, [step])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const goTo = (index: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.current?.scrollTo({ left: index * step(), behavior: reduce ? 'auto' : 'smooth' })
  }

  const button =
    'hidden size-[45px] items-center justify-center rounded-full bg-[#e8e8e8] text-black transition-all duration-200 hover:enabled:bg-black hover:enabled:text-white disabled:cursor-not-allowed disabled:text-black/40 min-[992px]:flex'

  return (
    <div className="min-w-0">
      <ul
        aria-label={label}
        className="-mr-3 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] min-[992px]:mr-0"
        onScroll={update}
        ref={track}
        style={{ gap: GAP }}
        tabIndex={0}
      >
        {children.map((child, i) => (
          <li key={i} className="w-[280px] shrink-0 snap-start">
            {child}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-center gap-4 min-[992px]:mt-16">
        <button
          aria-label="Posts anteriores"
          className={button}
          disabled={state.start}
          onClick={() => goTo(Math.max(0, state.index - 1))}
          type="button"
        >
          <ArrowRightIcon className="w-[18px] rotate-180" />
        </button>
        <div aria-hidden className="flex items-center gap-2">
          {Array.from({ length: state.pages }, (_, i) => (
            <button
              key={i}
              className={cn(
                'h-2 rounded-[5px] transition-all duration-200 hover:bg-black',
                i === state.index ? 'w-[30px] bg-black' : 'w-2 bg-[#e8e8e8]',
              )}
              onClick={() => goTo(i)}
              tabIndex={-1}
              type="button"
            />
          ))}
        </div>
        <button
          aria-label="Próximos posts"
          className={button}
          disabled={state.end}
          onClick={() => goTo(Math.min(state.pages - 1, state.index + 1))}
          type="button"
        >
          <ArrowRightIcon className="w-[18px]" />
        </button>
      </div>
    </div>
  )
}
