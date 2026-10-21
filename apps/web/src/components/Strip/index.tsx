'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  children: React.ReactNode[]
  /** Width of each item from 992px (a class such as `min-[992px]:w-[calc((100%-2rem)/3)]`). */
  itemClassName: string
  /** Round arrows under the strip: "light" on dark sections, "dark" on light ones. */
  tone?: 'light' | 'dark'
  /** Under 992px: swipe sideways (items 85% wide) instead of stacking. */
  mobileScroll?: boolean
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

  const button = cn(
    'flex size-[2.75rem] items-center justify-center rounded-full transition-colors motion-reduce:transition-none',
    tone === 'dark'
      ? 'bg-[#e8e8e8] text-black hover:bg-[#d6d6d6]'
      : 'bg-white/20 text-white hover:bg-white/30',
  )

  return (
    <div className={cn('min-w-0', className)}>
      <ul
        ref={ref}
        className={cn(
          'm-0 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          !mobileScroll && 'max-[991px]:flex-col max-[991px]:overflow-visible',
        )}
      >
        {items.map((child, i) => (
          <li
            key={i}
            className={cn(
              'snap-start min-[992px]:shrink-0',
              mobileScroll ? 'w-[85%] shrink-0 min-[992px]:w-auto' : '',
              itemClassName,
            )}
          >
            {child}
          </li>
        ))}
      </ul>
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
    </div>
  )
}
