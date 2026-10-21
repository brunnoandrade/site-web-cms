'use client'

import { ArrowLeft, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { Header } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

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
 * the left (400px at most, blurred background, backdrop). A mega menu opens as a second panel
 * (drill-down): back arrow, title, description and the link groups as cards.
 */
export const HeaderClient: React.FC<Props> = ({ data, siteName }) => {
  const pathname = usePathname()
  const rootId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const togglerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
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
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
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

  // Drill-down: move focus to the back arrow when a mega menu panel opens.
  useEffect(() => {
    if (mobileMega !== null) backRef.current?.focus()
  }, [mobileMega])

  const goBack = () => {
    const index = mobileMega
    setMobileMega(null)
    requestAnimationFrame(() =>
      drawerRef.current?.querySelector<HTMLElement>(`[data-mega-trigger="${index}"]`)?.focus(),
    )
  }

  const activeMega =
    mobileMega !== null && items[mobileMega]?.kind === 'mega' ? items[mobileMega].mega : null

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
            className="relative ml-4 mt-[0.6px] shrink-0"
            href="/"
          >
            <BrandLogo alt={siteName} />
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
                    <svg
                      aria-hidden
                      className="ml-2 h-2 w-[11px]"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 11 7"
                    >
                      <path
                        d="M5.417 6.833 0 2.917V0l4.167 3.083 1.25.875 1.25-.875L10.833 0v2.917z"
                        fill="currentColor"
                      />
                    </svg>
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

          {cta && (
            <CMSLink
              {...cta}
              appearance="inline"
              className={cn(ctaClass, 'ml-auto min-[992px]:ml-0')}
            />
          )}

          <button
            aria-controls={`${rootId}-drawer`}
            aria-expanded={mobileOpen}
            aria-label="Abrir menu"
            className="mx-4 inline-flex size-[30px] shrink-0 items-center justify-center rounded-md min-[992px]:hidden"
            onClick={() => setMobileOpen(true)}
            ref={togglerRef}
            type="button"
          >
            <svg aria-hidden fill="none" height="26" viewBox="0 0 24 24" width="26">
              <path
                clipRule="evenodd"
                d="M21.333 5H3v2.5h18.333zm0 5.833H3v2.5h18.333zM3 16.667h18.333v2.5H3z"
                fill="currentColor"
                fillRule="evenodd"
              />
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
        <div className="flex h-[70px] shrink-0 items-center justify-between bg-[#00000080] px-4">
          {activeMega ? (
            <button
              aria-label="Voltar"
              className="inline-flex size-[30px] items-center justify-center rounded-md"
              onClick={goBack}
              ref={backRef}
              type="button"
            >
              <ArrowLeft aria-hidden className="h-[18px] w-5" strokeWidth={2.5} />
            </button>
          ) : (
            <Link aria-label={`${siteName}, página inicial`} href="/" onClick={closeAll}>
              <BrandLogo alt={siteName} />
            </Link>
          )}
          <button
            aria-label="Fechar menu"
            className="inline-flex size-[30px] items-center justify-center rounded-md"
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

        {activeMega ? (
          <nav aria-label={activeMega.label ?? undefined} className="pb-8 pt-8">
            <div className="mb-10 px-4">
              <p className="text-[35px] font-semibold leading-[1.3]">
                {activeMega.title || activeMega.label}
              </p>
              {activeMega.description && (
                <p className="mb-4 max-w-[12.5rem] whitespace-pre-line text-xl font-light leading-[1.5]">
                  {activeMega.description}
                </p>
              )}
            </div>
            {(activeMega.groups ?? []).map((group, g) => (
              <div className="mx-4 mb-4 rounded-lg bg-white/[0.08]" key={group.id ?? g}>
                {group.label && (
                  <p className="px-4 pt-4 text-sm leading-[1.3] text-white/50 mb-2">
                    {group.label}
                  </p>
                )}
                <ul>
                  {(group.links ?? []).map(({ link, id }, j) => (
                    <li className="border-b border-white/[0.08] last:border-b-0" key={id ?? j}>
                      <CMSLink
                        {...link}
                        appearance="inline"
                        className="flex items-center justify-between p-4 text-base"
                      >
                        <ChevronRight aria-hidden className="size-6" />
                      </CMSLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : (
          <nav aria-label="Principal" className="px-4 pb-8 pt-12">
            <ul className="flex flex-col">
              {items.map((item, i) => (
                <li key={item.id ?? i}>
                  {item.kind === 'mega' ? (
                    <button
                      className="font-[family-name:var(--font-heading)] flex w-full items-center justify-between py-4 text-2xl font-medium leading-9"
                      data-mega-trigger={i}
                      onClick={() => setMobileMega(i)}
                      type="button"
                    >
                      {item.mega?.label}
                      <ChevronRight aria-hidden className="size-6" />
                    </button>
                  ) : (
                    <CMSLink
                      {...item.link}
                      appearance="inline"
                      className="font-[family-name:var(--font-heading)] block py-4 text-2xl font-medium leading-9"
                    />
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

/**
 * Uber Conta logo (white, for the dark header), from the current site, in public/brand. A static
 * file because the media collection refuses SVG (docs/seguranca.md); `data.logo` is not used here.
 */
const BrandLogo = ({ alt }: { alt: string }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img
    alt={alt}
    className="h-[17px] w-auto"
    decoding="async"
    height={14}
    src="/brand/uber-conta-logo.svg"
    width={96}
  />
)

const MegaPanel = ({ id, item }: { id: string; item: NavItem }) => {
  const mega = item.mega
  if (!mega) return null

  return (
    <div
      aria-label={mega.label}
      className="hidden border-t border-white/10 px-7 pb-10 pt-[31px] min-[992px]:grid min-[992px]:grid-cols-[337px_1fr] min-[992px]:gap-9"
      id={id}
      role="region"
    >
      <div>
        {mega.title && (
          <p className="font-[family-name:var(--font-heading)] mb-2 text-[2rem] font-semibold leading-none">
            {mega.title}
          </p>
        )}
        {mega.description && (
          <p className="font-[family-name:var(--font-heading)] max-w-[10.5rem] text-base font-light">
            {mega.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-x-6 gap-y-6">
        {(mega.groups ?? []).map((group, g) => (
          <div key={group.id ?? g}>
            <p className="mb-2 text-sm leading-[1.3] text-white/50">{group.label}</p>
            <ul>
              {(group.links ?? []).map(({ link, id: linkId }, j) => (
                <li key={linkId ?? j}>
                  <CMSLink
                    {...link}
                    appearance="inline"
                    className="relative inline-block py-1 text-base font-normal after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-200 after:ease-[ease-in-out] hover:after:w-full focus-visible:after:w-full motion-reduce:after:transition-none"
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
