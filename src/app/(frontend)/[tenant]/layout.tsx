import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { AnchorScroll } from '@/components/AnchorScroll'
import { JsonLd } from '@/components/JsonLd'
import { UiTextsProvider } from '@/components/UiTexts'
import { appNode, siteNodes } from '@/lib/jsonld'
import { uiTextsOf } from '@/lib/uiTexts'
import { isUberConta } from '@/lib/uber-help'
import { themeStyle } from '@/lib/themes'
import { setCurrentTenant } from '@/lib/currentTenant'
import { requireTenant } from '@/lib/tenant'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { SEO_ROBOTS } from '@/utilities/seo'

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
  setCurrentTenant(tenant.slug)
  const { isEnabled } = await draftMode()

  return (
    <div data-theme={tenant.themePreset ?? undefined} style={themeStyle(tenant.themePreset)}>
      <AdminBar
        adminBarProps={{
          preview: isEnabled,
        }}
      />

      <AnchorScroll />
      <JsonLd
        data={[
          ...siteNodes(tenant, isUberConta(tenant) ? '/central-de-ajuda/busca' : undefined),
          ...(appNode(tenant) ? [appNode(tenant)!] : []),
        ]}
      />
      <UiTextsProvider value={uiTextsOf(tenant)}>{children}</UiTextsProvider>
    </div>
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
    robots: SEO_ROBOTS,
  }
}

export async function generateViewport({ params }: Omit<Args, 'children'>): Promise<Viewport> {
  const tenant = await requireTenant((await params).tenant)
  return tenant.themePreset === 'uber-conta' ? { themeColor: '#000000' } : {}
}
