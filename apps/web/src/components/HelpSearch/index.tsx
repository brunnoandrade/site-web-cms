'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

type Suggestion = { question: string; slug: string }

type Props = {
  placeholder: string
  /** Where the form goes on Enter and where the terms below link to (`?q=`). */
  searchPath: string
  /** Where each question links to (`<questionBase>/<slug>`). */
  questionBase: string
  /** Terms shown when the box is focused and empty. */
  popular?: string[]
}

const SearchIcon = () => (
  <svg
    aria-hidden
    className="absolute left-5 top-1/2 size-[18px] -translate-y-1/2"
    viewBox="0 0 18 18"
  >
    <path
      d="M18.0001 16.25L14.3335 12.5833C15.2502 11.25 15.8333 9.66667 15.8333 7.91669C15.8333 3.58336 12.25 0 7.91667 0C3.58333 0 0 3.58336 0 7.91669C0 12.25 3.58333 15.8333 7.91667 15.8333C9.66667 15.8333 11.2501 15.25 12.5834 14.3333L16.25 18L18.0001 16.25ZM2.5 8.00001C2.5 5.00001 4.91667 2.58334 7.91667 2.58334C10.9167 2.58334 13.3333 5.00001 13.3333 8.00001C13.3333 11 10.9167 13.4167 7.91667 13.4167C4.91667 13.4167 2.5 11 2.5 8.00001Z"
      fill="currentColor"
    />
  </svg>
)

const TrendingIcon = () => (
  <svg aria-hidden className="mr-4 h-3 w-[19px] shrink-0" viewBox="0 0 19 12">
    <path
      d="M18.4167 0V7.08333L15.9167 9.58333V4.25001L9.66667 10.5L6.33334 7.16668L1.75001 11.75L0 10L6.33334 3.66666L9.66667 6.99999L14.1667 2.5H8.83333L11.3333 0H18.4167Z"
      fill="currentColor"
    />
  </svg>
)

const itemClass =
  'flex items-center border-0 border-b border-solid border-[#f3f3f3]/50 p-4 text-sm leading-[1.5] text-[#a6a6a6] no-underline transition-colors duration-200 ease-in-out hover:bg-[#f3f3f3]/50 hover:text-black focus-visible:bg-[#f3f3f3]/50 focus-visible:text-black motion-reduce:transition-none'

/** Bold the part of the question the person has typed (case and accents ignored). */
const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const index = fold(text).indexOf(fold(query.trim()))
  if (index < 0 || !query.trim()) return <>{text}</>
  const end = index + query.trim().length
  return (
    <>
      {text.slice(0, index)}
      <strong>{text.slice(index, end)}</strong>
      {text.slice(end)}
    </>
  )
}

/**
 * Help center search: focus shows popular terms, typing shows up to 5 matching questions (each one
 * links to its page), "Enter" goes to the full search. The X clears the box; a click outside or
 * Esc closes the list.
 */
export const HelpSearch: React.FC<Props> = ({
  placeholder,
  searchPath,
  questionBase,
  popular = ['Pix', 'Empréstimos', 'Aplicativo'],
}) => {
  const id = useId()
  const wrapper = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Suggestion[] | null>(null)

  useEffect(() => {
    const term = query.trim()
    if (!term) {
      setItems(null)
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      fetch(`/api/help-suggest?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { items: [] }))
        .then((data: { items: Suggestion[] }) => setItems(data.items))
        .catch(() => undefined)
    }, 150)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [])

  const typing = query.trim().length > 0

  return (
    <div
      ref={wrapper}
      className="relative mx-auto max-w-[740px] text-black"
      onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
    >
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <div className="relative z-[100]">
        <SearchIcon />
        <input
          aria-expanded={open}
          autoComplete="off"
          className={cn(
            'block h-[73px] w-full rounded-2xl border-2 border-solid border-transparent bg-white px-12 py-6 text-sm font-normal leading-[1.5] text-black shadow-[0_3px_3px_#00000003] outline-none transition-[border-color,box-shadow] duration-150 ease-in-out placeholder:text-black/75 focus:border-black motion-reduce:transition-none',
          )}
          id={id}
          name="q"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          type="text"
          value={query}
        />
        {typing && (
          <button
            aria-label="Limpar busca"
            className="absolute right-6 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 text-black"
            onClick={() => {
              setQuery('')
              setOpen(false)
            }}
            type="button"
          >
            <svg aria-hidden className="size-4" viewBox="0 0 16 16">
              <path
                d="M15.1667 1.83329L13.3333 0L7.58332 5.83333L1.83329 0L0 1.83329L5.83333 7.58332L0 13.3333L1.83329 15.1667L7.58332 9.33333L13.3333 15.1667L15.1667 13.3333L9.33333 7.58332L15.1667 1.83329Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
      {open && (!typing || items) && (
        <div className="absolute inset-x-0 top-full z-50 -mt-2.5 overflow-hidden rounded-b-2xl bg-white pt-2.5 shadow-[0_4px_12px_#0000001a]">
          {!typing || (items && items.length > 0) ? (
            <>
              <p className="m-0 mt-6 p-4 text-base font-semibold leading-none text-black">
                Sugestões:
              </p>
              <ul className="m-0 list-none p-0">
                {typing
                  ? items!.map((item) => (
                      <li key={item.slug}>
                        <a className={itemClass} href={`${questionBase}/${item.slug}`}>
                          <TrendingIcon />
                          <span>
                            <Highlight query={query} text={item.question} />
                          </span>
                        </a>
                      </li>
                    ))
                  : popular.map((term) => (
                      <li key={term}>
                        <a
                          className={itemClass}
                          href={`${searchPath}?q=${encodeURIComponent(term)}`}
                        >
                          <TrendingIcon />
                          <span>{term}</span>
                        </a>
                      </li>
                    ))}
              </ul>
            </>
          ) : (
            <p className="m-0 mt-6 p-4 text-base font-light leading-none text-black/50">
              Nenhuma sugestão encontrada
            </p>
          )}
        </div>
      )}
    </div>
  )
}
