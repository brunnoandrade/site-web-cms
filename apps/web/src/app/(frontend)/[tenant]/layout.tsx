import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { requireTenant } from '@/lib/tenant'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

// Tenants are rendered on the first request and cached (ISR); nothing is prerendered at build.
export function generateStaticParams() {
  return []
}

type Args = {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLayout({ children, params }: Args) {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)
  const { isEnabled } = await draftMode()

  return (
    <>
      <AdminBar
        adminBarProps={{
          preview: isEnabled,
        }}
      />

      {/* WCAG 2.4.1: lets keyboard users skip the navigation. */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900"
        href="#conteudo"
      >
        Pular para o conteúdo
      </a>
      <Header tenant={tenant.slug} />
      {/* Offset for the fixed header; a dark hero pulls itself under it (see heros/BrandHero). */}
      <main className="pt-24" id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <Footer tenant={tenant.slug} />
    </>
  )
}

export async function generateMetadata({ params }: Omit<Args, 'children'>): Promise<Metadata> {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)

  return {
    metadataBase: new URL(tenant.siteUrl),
    openGraph: mergeOpenGraph({ siteName: tenant.name, url: `${tenant.siteUrl}/` }),
    twitter: {
      card: 'summary_large_image',
    },
  }
}
