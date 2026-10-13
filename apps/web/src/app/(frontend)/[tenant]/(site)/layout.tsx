import React from 'react'

import { SiteChrome } from '@/components/SiteChrome'
import { requireTenant } from '@/lib/tenant'

type Args = {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

// Blog, help center and search always carry the menu and footer. Pages (`[[...slug]]`) choose
// theirs through the page template.
export default async function SiteLayout({ children, params }: Args) {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)

  return <SiteChrome tenant={tenant.slug}>{children}</SiteChrome>
}
