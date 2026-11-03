'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { cn } from '@/utilities/ui'

/** Gap between slides (px), same as the current site. */
const GAP = 20

/**
 * Scroll-snap carousel: works with touch, trackpad and keyboard (the list scrolls natively and each
 * slide is reachable). Round buttons (from 992px) and a dot indicator move one slide at a time; no
 * autoplay (WCAG 2.2.2). The heading sits on the left from 992px and the track bleeds to the right edge.
 */
export const Carousel: React.FC<{ heading: React.ReactNode; label: string; children: React.ReactNode[] }> = ({
  heading,
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
    'hidden size-[45px] items-center justify-center rounded-full bg-white/25 text-white transition-all duration-200 hover:enabled:bg-white hover:enabled:text-brand-blue disabled:cursor-not-allowed disabled:text-white/40 min-[992px]:flex'

  return (
    <div className="flex flex-wrap">
      <div className="mb-8 w-full min-[992px]:w-1/3 min-[992px]:pr-3">{heading}</div>
      <div className="w-full min-w-0 min-[992px]:w-2/3 min-[992px]:pl-3">
        <ul
          aria-label={label}
          className="-mr-3 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] min-[992px]:mr-0"
          onScroll={update}
          ref={track}
          style={{ gap: GAP }}
          tabIndex={0}
        >
          {children.map((child, i) => (
            <li key={i} className="w-[304px] shrink-0 snap-start min-[1200px]:w-[364px]">
              {child}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-center gap-4 min-[992px]:justify-start">
          <button
            aria-label="Depoimento anterior"
            className={button}
            disabled={state.start}
            onClick={() => goTo(Math.max(0, state.index - 1))}
            type="button"
          >
            <ArrowRightIcon className="w-[18px] rotate-180" />
          </button>
          <div className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: state.pages }, (_, i) => (
              <button
                key={i}
                className={cn(
                  'h-2 cursor-pointer rounded-[5px] transition-all duration-200 hover:bg-white',
                  i === state.index ? 'w-[30px] bg-white' : 'w-2 bg-white/25',
                )}
                onClick={() => goTo(i)}
                tabIndex={-1}
                type="button"
              />
            ))}
          </div>
          <button
            aria-label="Próximo depoimento"
            className={button}
            disabled={state.end}
            onClick={() => goTo(Math.min(state.pages - 1, state.index + 1))}
            type="button"
          >
            <ArrowRightIcon className="w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
