'use client'

import { ChevronDown, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { Header } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

import { Picture } from '@/components/Picture'

type NavItem = NonNullable<Header['navItems']>[number]

type Props = {
  data: Partial<Header>
  siteName: string
}

/**
 * Uber Conta header, measured on the current site.
 *
 * Desktop (from 992px): translucent dark bar, 60px tall, centered menu, CTA on the right. An item
 * can open a mega menu (title, description and columns of links) on hover with a mouse, or on
 * click / keyboard (disclosure widget: `aria-expanded`, Escape closes and returns focus).
 *
 * Mobile (under 992px): 65px bar with logo, CTA and a hamburger; the menu opens in a drawer from
 * the left (400px at most, blurred background, backdrop), with accordions for the mega menus.
 */
export const HeaderClient: React.FC<Props> = ({ data, siteName }) => {
  const pathname = usePathname()
  const rootId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const togglerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
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
      const wasDrawer = mobileOpen
      closeAll()
      if (index !== null) triggers.current[index]?.focus()
      else if (wasDrawer) togglerRef.current?.focus()
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

  // Drawer: lock the page scroll, move focus inside and keep Tab within it.
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onTab)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onTab)
    }
  }, [mobileOpen])

  const cta = data.enableCta && data.cta?.label ? data.cta : null
  const panelId = (index: number) => `${rootId}-mega-${index}`
  // Menu buttons of the current site: pill, 16px, regular weight, 1px side margin.
  const linkClass =
    'mx-px inline-flex items-center rounded-full px-5 py-[0.55rem] text-base font-normal hover:bg-white/10 focus-visible:bg-white/10'
  const ctaClass =
    'inline-flex items-center rounded-full bg-white/[0.24] px-5 py-[0.55rem] text-base font-normal hover:bg-white/[0.32]'

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-3" ref={rootRef}>
      {/* Bar width = container (1140px at most) minus its 12px gutters. */}
      <div
        className={cn(
          'mx-auto max-w-[calc(1140px-1.5rem)] bg-[#282828]/70 text-white backdrop-blur-[7px] backdrop-brightness-110 backdrop-saturate-[1.8]',
          openMega === null ? 'rounded-[2rem]' : 'rounded-t-[2rem] rounded-b-2xl',
        )}
        onPointerLeave={(event) => event.pointerType === 'mouse' && setOpenMega(null)}
      >
        <div className="flex h-[65px] items-center px-[0.7rem] min-[992px]:h-[60px]">
          <Link
            aria-label={`${siteName}, página inicial`}
            className="relative -mt-[3px] ml-4 shrink-0"
            href="/"
          >
            <Picture alt={siteName} className="h-[17px] w-auto" image={data.logo} loading="eager" />
            {!data.logo && <span className="text-lg font-semibold">{siteName}</span>}
          </Link>

          <div className="hidden grow items-center min-[992px]:flex">
            <nav aria-label="Principal" className="mx-auto flex items-center">
              {items.map((item, i) =>
                item.kind === 'mega' ? (
                  <button
                    aria-controls={panelId(i)}
                    aria-expanded={openMega === i}
                    className={linkClass}
                    key={item.id ?? i}
                    onClick={() => setOpenMega(openMega === i ? null : i)}
                    onPointerEnter={(event) => event.pointerType === 'mouse' && setOpenMega(i)}
                    ref={(el) => {
                      triggers.current[i] = el
                    }}
                    type="button"
                  >
                    {item.mega?.label}
                    <ChevronDown aria-hidden className="ml-2 h-2 w-[11px]" strokeWidth={3} />
                  </button>
                ) : (
                  <CMSLink
                    key={item.id ?? i}
                    {...item.link}
                    appearance="inline"
                    className={linkClass}
                  />
                ),
              )}
            </nav>
          </div>

          {cta && <CMSLink {...cta} appearance="inline" className={cn(ctaClass, 'ml-auto min-[992px]:ml-0')} />}

          <button
            aria-controls={`${rootId}-drawer`}
            aria-expanded={mobileOpen}
            aria-label="Abrir menu"
            className="mx-4 inline-flex size-[30px] shrink-0 items-center justify-center rounded-md min-[992px]:hidden"
            onClick={() => setMobileOpen(true)}
            ref={togglerRef}
            type="button"
          >
            <svg aria-hidden fill="none" height="30" viewBox="0 0 30 30" width="30">
              <path d="M4 7h22M4 15h22M4 23h22" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Desktop mega menus: one region per item, only the open one is rendered. */}
        {items.map((item, i) =>
          item.kind === 'mega' && openMega === i ? (
            <MegaPanel id={panelId(i)} item={item} key={item.id ?? i} />
          ) : null,
        )}
      </div>

      {/* Mobile drawer (offcanvas): backdrop + panel sliding from the left. */}
      <div
        aria-hidden
        className={cn(
          'fixed inset-0 z-[55] bg-black/50 transition-opacity duration-300 motion-reduce:transition-none min-[992px]:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeAll}
      />
      <div
        aria-label="Menu"
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 left-0 z-[60] flex w-[400px] max-w-full flex-col overflow-y-auto bg-[#282828]/[0.72] text-white backdrop-blur-[10px] transition-transform duration-300 motion-reduce:transition-none min-[992px]:hidden',
          mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
        id={`${rootId}-drawer`}
        inert={!mobileOpen}
        ref={drawerRef}
        role="dialog"
      >
        <div className="flex h-[65px] shrink-0 items-center justify-between px-[0.7rem]">
          <Link aria-label={`${siteName}, página inicial`} className="ml-4" href="/" onClick={closeAll}>
            <Picture alt={siteName} className="h-[17px] w-auto" image={data.logo} loading="eager" />
          </Link>
          <button
            aria-label="Fechar menu"
            className="mx-4 inline-flex size-[30px] items-center justify-center rounded-md"
            onClick={() => {
              closeAll()
              togglerRef.current?.focus()
            }}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden className="size-6" />
          </button>
        </div>

        <nav aria-label="Principal" className="px-5 pb-8 pt-2">
          <ul className="flex flex-col">
            {items.map((item, i) => (
              <li key={item.id ?? i}>
                {item.kind === 'mega' ? (
                  <>
                    <button
                      aria-controls={`${panelId(i)}-m`}
                      aria-expanded={mobileMega === i}
                      className="flex w-full items-center justify-between py-3 text-lg font-normal"
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
                      <div className="pb-3" id={`${panelId(i)}-m`}>
                        {(item.mega?.groups ?? []).map((group, g) => (
                          <div className="mb-4" key={group.id ?? g}>
                            <p className="mb-1 text-sm text-white/60">{group.label}</p>
                            <ul>
                              {(group.links ?? []).map(({ link, id }, j) => (
                                <li key={id ?? j}>
                                  <CMSLink {...link} appearance="inline" className="block py-2 text-base" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <CMSLink {...item.link} appearance="inline" className="block py-3 text-lg font-normal" />
                )}
              </li>
            ))}
          </ul>
        </nav>
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
      className="hidden border-t border-white/10 px-10 pb-10 pt-8 min-[992px]:grid min-[992px]:grid-cols-[1fr_3fr] min-[992px]:gap-10"
      id={id}
      role="region"
    >
      <div>
        {mega.title && <p className="text-3xl font-semibold leading-tight">{mega.title}</p>}
        {mega.description && <p className="mt-3 max-w-[14rem] text-sm font-light text-white/80">{mega.description}</p>}
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
                    className="text-base font-normal hover:text-turquoise-300 focus-visible:text-turquoise-300"
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
