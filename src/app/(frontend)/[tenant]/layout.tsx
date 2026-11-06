import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { AnchorScroll } from '@/components/AnchorScroll'
import { JsonLd } from '@/components/JsonLd'
import { Tracking } from '@/components/Tracking'
import { appNode, siteNodes } from '@/lib/jsonld'
import { isUberConta } from '@/lib/uber-help'
import { themeStyle } from '@/lib/themes'
import { setCurrentTenant } from '@/lib/currentTenant'
import { requireTenant } from '@/lib/tenant'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { robotsOf, seoDescription } from '@/utilities/seo'
import { getMediaUrl } from '@/utilities/getMediaUrl'

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
      {children}
      {!isEnabled && (
        <Tracking
          consentBanner={tenant.tracking?.consentBanner}
          ga4Id={tenant.tracking?.ga4Id}
          gtmId={tenant.tracking?.gtmId}
          privacyUrl={tenant.tracking?.privacyUrl}
          tenant={tenant.slug}
        />
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Omit<Args, 'children'>): Promise<Metadata> {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)

  const mediaOf = (image: typeof tenant.favicon) =>
    image && typeof image === 'object' && image.url ? getMediaUrl(image.url) : undefined
  const favicon = mediaOf(tenant.favicon)
  const appIcon = mediaOf(tenant.appIcon)

  return {
    metadataBase: new URL(tenant.siteUrl),
    description: seoDescription(tenant),
    openGraph: mergeOpenGraph({
      siteName: tenant.name,
      url: `${tenant.siteUrl}/`,
      description: seoDescription(tenant),
    }),
    twitter: {
      card: 'summary_large_image',
    },
    robots: robotsOf(tenant),
    // The property's own icons; without them, the platform's (public/).
    icons: {
      icon: favicon
        ? [{ url: favicon, type: 'image/png' }]
        : [
            { url: '/favicon.ico', sizes: '32x32' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
          ],
      apple: appIcon ?? '/icons/apple-touch-icon.png',
    },
  }
}

export async function generateViewport({ params }: Omit<Args, 'children'>): Promise<Viewport> {
  const tenant = await requireTenant((await params).tenant)
  return tenant.themePreset === 'uber-conta' ? { themeColor: '#000000' } : {}
}
