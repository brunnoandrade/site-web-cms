'use client'

import React, { useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

type Item = { id: string; title: string }

/**
 * "Neste artigo você vai ver" (current site: `.blog-article__toc`). Blue bullet before each link,
 * black text; the section being read is blue and medium weight (`a.active`).
 */
export const ArticleToc: React.FC<{ items: Item[] }> = ({ items }) => {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const update = () => {
      let current = items[0]?.id
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 160) current = id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [items])

  return (
    <ul className="m-0 list-none p-0">
      {items.map(({ id, title }) => (
        <li key={id} className="mb-[0.6rem] before:mr-2 before:text-[#276ef1] before:content-['•']">
          <a
            className={cn(
              'no-underline hover:text-[#276ef1]',
              active === id ? 'font-medium text-[#276ef1]' : 'text-black',
            )}
            href={`#${id}`}
          >
            {title}
          </a>
        </li>
      ))}
    </ul>
  )
}
