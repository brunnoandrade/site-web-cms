'use client'

import React, { useState } from 'react'

import type { StepsBlock as StepsBlockProps } from '@digio/payload-types'

import { Picture } from '@/components/Picture'
import { cn } from '@/utilities/ui'

type Items = NonNullable<StepsBlockProps['items']>

/**
 * Desktop: a phone with the screen of the open step, and the list with one step open at a time
 * (hover or click opens it). Mobile: all steps open, numbered, each with its screen on top.
 */
export const StepsList: React.FC<{ items: Items }> = ({ items }) => {
  const [active, setActive] = useState(0)
  const current = items[active]

  return (
    <>
      <div className="max-[991px]:hidden min-[992px]:col-span-5 min-[1200px]:col-span-4">
        {/* Some screens already include the phone frame (wider files, e.g. the WhatsApp one): no second frame. */}
        {typeof current?.image === 'object' && (current.image?.width ?? 0) > 400 ? (
          <Picture
            alt={current.image?.alt ?? ''}
            className="mx-auto block h-auto w-[440px] max-w-none"
            image={current.image}
          />
        ) : (
          <div className="mx-auto my-6 w-[320px] overflow-hidden rounded-[3rem] border-[10px] border-[#2a2a2a] bg-black p-0 shadow-[0_30px_60px_rgba(255,255,255,0.06)]">
            <Picture
              alt={typeof current?.image === 'object' ? (current.image?.alt ?? '') : ''}
              className="block h-[620px] w-full object-cover object-top"
              image={current?.image as never}
            />
          </div>
        )}
      </div>

      <ul className="m-0 list-none p-0 [counter-reset:step] max-[991px]:grid max-[991px]:-mt-6 min-[992px]:col-span-7 min-[1200px]:col-span-4">
        {items.map((item, i) => {
          const open = i === active
          return (
            <li className={cn('max-[991px]:[grid-area:1/1]', !open && 'max-[991px]:invisible')} key={item.id ?? i}>
              <div
                className={cn(
                  'p-4 text-white transition-all duration-200 motion-reduce:transition-none min-[992px]:cursor-pointer min-[992px]:border-b min-[992px]:border-white/20 min-[992px]:px-0 max-[991px]:px-1',
                  open
                    ? 'min-[992px]:opacity-100'
                    : 'min-[992px]:opacity-40 min-[992px]:hover:opacity-100',
                )}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                tabIndex={0}
              >
                <div className="mb-4 flex items-center justify-center rounded-2xl bg-[#5e5e5e] p-2 min-[992px]:hidden">
                  <Picture
                    alt=""
                    className="max-h-[280px] w-auto"
                    image={item.imageMobile ?? item.image}
                  />
                </div>
                <h4
                  className={cn(
                    'm-0 text-2xl font-medium before:mb-2 before:block before:text-[140%] before:opacity-70 before:content-[counter(step,decimal-leading-zero)_"."] [counter-increment:step] min-[992px]:before:mb-1 min-[992px]:before:text-2xl',
                    open
                      ? 'min-[992px]:text-2xl'
                      : 'min-[992px]:text-base min-[992px]:font-light min-[992px]:before:text-2xl',
                  )}
                >
                  {item.title}
                </h4>
                {item.text && (
                  <p className={cn('mb-0 mt-2 font-light text-white', !open && 'min-[992px]:hidden')}>
                    {item.text}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mb-12 mt-4 flex justify-center gap-2 min-[992px]:hidden">
        {items.map((item, i) => (
          <button
            key={item.id ?? i}
            aria-label={`Passo ${i + 1}`}
            aria-current={i === active}
            className={cn(
              'h-2 rounded-full transition-all motion-reduce:transition-none',
              i === active ? 'w-8 bg-white' : 'w-2 bg-white/20',
            )}
            onClick={() => setActive(i)}
            type="button"
          />
        ))}
      </div>
    </>
  )
}
