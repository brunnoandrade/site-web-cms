'use client'

import { ChevronDown, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { Header } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

import { Picture } from './Picture'

type NavItem = NonNullable<Header['navItems']>[number]

type Props = {
  data: Partial<Header>
  siteName: string
}

/**
 * Uber Conta header: dark floating bar with a centered menu and a CTA. An item can open a mega
 * menu (title, description and columns of links). The mega menu is a disclosure widget:
 * a button with `aria-expanded`, closed with Escape (focus returns to the button), a click
 * outside or navigation. On mobile everything folds into one panel with accordions.
 */
export const HeaderClient: React.FC<Props> = ({ data, siteName }) => {
  const pathname = usePathname()
  const rootId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const triggers = useRef<Record<number, HTMLButtonElement | null>>({})

  const [openMega, setOpenMega] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileMega, setMobileMega] = useState<number | null>(null)

  const items = (data.navItems ?? []).filter((item) =>
    item.kind === 'mega' ? item.mega?.label : item.link?.label,
  )

  const closeAll = useCallback(() => {
    setOpenMega(null)
    setMobileOpen(false)
    setMobileMega(null)
  }, [])

  // Close everything on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    closeAll()
  }

  useEffect(() => {
    if (openMega === null && !mobileOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const index = openMega
      closeAll()
      if (index !== null) triggers.current[index]?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeAll()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [openMega, mobileOpen, closeAll])

  const cta = data.enableCta && data.cta?.label ? data.cta : null
  const panelId = (index: number) => `${rootId}-mega-${index}`
  const linkClass = 'text-sm font-medium hover:text-turquoise-300 focus-visible:text-turquoise-300'

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6" ref={rootRef}>
      <div className="mx-auto max-w-[80rem] rounded-3xl bg-navy-900/95 text-white shadow-lg backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 pl-6 pr-3">
          <Link aria-label={`${siteName}, página inicial`} className="shrink-0" href="/">
            <Picture alt={siteName} className="h-6 w-auto" image={data.logo} loading="eager" />
            {!data.logo && <span className="text-lg font-semibold">{siteName}</span>}
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
            {items.map((item, i) =>
              item.kind === 'mega' ? (
                <button
                  aria-controls={panelId(i)}
                  aria-expanded={openMega === i}
                  className={cn(linkClass, 'inline-flex items-center gap-1.5')}
                  key={item.id ?? i}
                  onClick={() => setOpenMega(openMega === i ? null : i)}
                  ref={(el) => {
                    triggers.current[i] = el
                  }}
                  type="button"
                >
                  {item.mega?.label}
                  <ChevronDown
                    aria-hidden
                    className={cn('size-4 transition-transform', openMega === i && 'rotate-180')}
                  />
                </button>
              ) : (
                <CMSLink key={item.id ?? i} {...item.link} appearance="inline" className={linkClass} />
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            {cta && (
              <CMSLink
                {...cta}
                appearance="inline"
                className="inline-flex h-11 items-center rounded-full bg-white/20 px-5 text-sm font-medium hover:bg-white/30"
              />
            )}
            <button
              aria-controls={`${rootId}-mobile`}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              type="button"
            >
              {mobileOpen ? <X aria-hidden /> : <Menu aria-hidden />}
            </button>
          </div>
        </div>

        {/* Desktop mega menus: one region per item, only the open one is rendered. */}
        {items.map((item, i) =>
          item.kind === 'mega' && openMega === i ? (
            <MegaPanel id={panelId(i)} item={item} key={item.id ?? i} />
          ) : null,
        )}

        {mobileOpen && (
          <nav aria-label="Principal" className="border-t border-white/10 px-6 pb-6 pt-2 md:hidden" id={`${rootId}-mobile`}>
            <ul className="flex flex-col">
              {items.map((item, i) => (
                <li key={item.id ?? i}>
                  {item.kind === 'mega' ? (
                    <>
                      <button
                        aria-controls={panelId(i)}
                        aria-expanded={mobileMega === i}
                        className="flex w-full items-center justify-between py-3 text-base font-medium"
                        onClick={() => setMobileMega(mobileMega === i ? null : i)}
                        type="button"
                      >
                        {item.mega?.label}
                        <ChevronDown
                          aria-hidden
                          className={cn('size-5 transition-transform', mobileMega === i && 'rotate-180')}
                        />
                      </button>
                      {mobileMega === i && (
                        <div className="pb-3" id={panelId(i)}>
                          {(item.mega?.groups ?? []).map((group, g) => (
                            <div className="mb-4" key={group.id ?? g}>
                              <p className="mb-1 text-xs text-white/60">{group.label}</p>
                              <ul>
                                {(group.links ?? []).map(({ link, id }, j) => (
                                  <li key={id ?? j}>
                                    <CMSLink {...link} appearance="inline" className="block py-2 text-sm" />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <CMSLink {...item.link} appearance="inline" className="block py-3 text-base font-medium" />
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}

const MegaPanel = ({ id, item }: { id: string; item: NavItem }) => {
  const mega = item.mega
  if (!mega) return null

  return (
    <div
      aria-label={mega.label}
      className="hidden border-t border-white/10 px-10 pb-10 pt-8 md:grid md:grid-cols-[1fr_3fr] md:gap-10"
      id={id}
      role="region"
    >
      <div>
        {mega.title && <p className="text-3xl font-semibold leading-tight">{mega.title}</p>}
        {mega.description && <p className="mt-3 max-w-[14rem] text-sm text-white/80">{mega.description}</p>}
      </div>

      <div className="grid grid-cols-3 gap-x-8 gap-y-10">
        {(mega.groups ?? []).map((group, g) => (
          <div key={group.id ?? g}>
            <p className="mb-3 text-sm text-white/60">{group.label}</p>
            <ul className="space-y-3">
              {(group.links ?? []).map(({ link, id: linkId }, j) => (
                <li key={linkId ?? j}>
                  <CMSLink
                    {...link}
                    appearance="inline"
                    className="text-base font-medium hover:text-turquoise-300 focus-visible:text-turquoise-300"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
