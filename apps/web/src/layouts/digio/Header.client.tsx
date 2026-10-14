'use client'

import { Menu, SearchIcon, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useId, useState } from 'react'

import type { Header } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

interface HeaderClientProps {
  data: Partial<Header>
}

/**
 * Floating navy header (Uber Conta pattern): logo, links, search and a highlighted CTA.
 * On mobile the links open in a panel below the bar.
 */
export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()
  const navItems = data?.navItems ?? []

  // Close the mobile menu on navigation and with Escape.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6">
      <div className="mx-auto max-w-[80rem] rounded-3xl bg-navy-900/95 text-white shadow-lg backdrop-blur md:rounded-full">
        <div className="flex h-16 items-center justify-between gap-4 pl-6 pr-3">
          <Link aria-label="Digio, página inicial" href="/">
            <Logo loading="eager" priority="high" variant="white" />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
            {navItems.map(({ link }, i) => (
              <CMSLink key={i} {...link} appearance="inline" className="text-sm font-medium hover:text-turquoise-400" />
            ))}
            <Link className="hover:text-turquoise-400" href="/search/">
              <span className="sr-only">Buscar</span>
              <SearchIcon aria-hidden className="size-5" />
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {data?.enableCta && data.cta && (
              <CMSLink {...data.cta} appearance="accent" size="sm" />
            )}
            <button
              aria-controls={panelId}
              aria-expanded={open}
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10 md:hidden"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              {open ? <X aria-hidden /> : <Menu aria-hidden />}
            </button>
          </div>
        </div>

        {open && (
          <nav aria-label="Principal" className="border-t border-white/10 px-6 pb-6 pt-2 md:hidden" id={panelId}>
            <ul className="flex flex-col">
              {navItems.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} appearance="inline" className="block py-3 text-base font-medium" />
                </li>
              ))}
              <li>
                <Link className="flex items-center gap-2 py-3 text-base font-medium" href="/search/">
                  <SearchIcon aria-hidden className="size-5" /> Buscar
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
