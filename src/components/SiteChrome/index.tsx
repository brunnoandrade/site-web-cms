import React from 'react'

import { getLayout } from '@/layouts'
import { requireTenant } from '@/lib/tenant'

import { SkipLink } from './SkipLink'

type Props = {
  children: React.ReactNode
  tenant: string
  /** Landing template: content only, without menu and footer. */
  bare?: boolean
}

/** Menu, footer and main landmark around a page. Pages of the "landing" template go bare. */
export const SiteChrome = async ({ children, tenant, bare = false }: Props) => {
  if (bare) {
    return (
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
    )
  }

  const { Header, Footer } = getLayout((await requireTenant(tenant)).layout)

  return (
    <>
      <SkipLink />
      <Header tenant={tenant} />
      {/* Offset for the fixed header; a dark hero pulls itself under it (see heros/BrandHero). */}
      <main className="pt-24" id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <Footer tenant={tenant} />
    </>
  )
}
