'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Scroll-snap carousel: works with touch, trackpad and keyboard (the list scrolls natively and each
 * slide is reachable). The buttons move one slide; no autoplay (WCAG 2.2.2).
 */
export const Carousel: React.FC<{ heading: React.ReactNode; label: string; children: React.ReactNode[] }> = ({
  heading,
  label,
  children,
}) => {
  const track = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const move = (direction: 1 | -1) => {
    const el = track.current
    const slide = el?.firstElementChild as HTMLElement | null
    if (!el || !slide) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * (slide.offsetWidth + 24), behavior: reduce ? 'auto' : 'smooth' })
  }

  const button =
    'inline-flex size-11 items-center justify-center rounded-full border border-current transition-opacity disabled:opacity-30'

  return (
    <>
      <div className="mb-10 flex items-end justify-between gap-6">
        {heading}
        <div className="hidden shrink-0 gap-3 md:flex">
          <button aria-label="Depoimento anterior" className={button} disabled={edges.start} onClick={() => move(-1)} type="button">
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button aria-label="Próximo depoimento" className={button} disabled={edges.end} onClick={() => move(1)} type="button">
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
      <ul
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
        onScroll={update}
        ref={track}
        tabIndex={0}
      >
        {children.map((child, i) => (
          <li key={i} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
            {child}
          </li>
        ))}
      </ul>
    </>
  )
}
