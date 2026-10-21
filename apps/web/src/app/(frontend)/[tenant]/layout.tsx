import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { AnchorScroll } from '@/components/AnchorScroll'
import { themeStyle } from '@/lib/themes'
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
    <div data-theme={tenant.themePreset ?? undefined} style={themeStyle(tenant.themePreset)}>
      <AdminBar
        adminBarProps={{
          preview: isEnabled,
        }}
      />

      <AnchorScroll />
      {children}
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
  }
}
