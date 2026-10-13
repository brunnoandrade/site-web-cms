import React from 'react'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'

type Props = {
  children: React.ReactNode
  tenant: string
  /** Landing template: content only, without menu and footer. */
  bare?: boolean
}

/** Menu, footer and main landmark around a page. Pages of the "landing" template go bare. */
export const SiteChrome: React.FC<Props> = ({ children, tenant, bare = false }) => {
  if (bare) {
    return (
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
    )
  }

  return (
    <>
      {/* WCAG 2.4.1: lets keyboard users skip the navigation. */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900"
        href="#conteudo"
      >
        Pular para o conteúdo
      </a>
      <Header tenant={tenant} />
      {/* Offset for the fixed header; a dark hero pulls itself under it (see heros/BrandHero). */}
      <main className="pt-24" id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <Footer tenant={tenant} />
    </>
  )
}
