import { headers } from 'next/headers'
import Link from 'next/link'
import React from 'react'

import { SiteChrome } from '@/components/SiteChrome'
import { Button } from '@/components/ui/button'
import { resolveTenantSlug } from '@/lib/tenantResolver'

// notFound() has no route params, so the tenant is resolved from the host like the proxy does.
// Without a tenant (should not happen behind the proxy) the 404 renders without menu and footer.
export default async function NotFound() {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? ''
  const tenant = await resolveTenantSlug(host).catch(() => null)

  const content = (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">This page could not be found.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )

  return tenant ? <SiteChrome tenant={tenant}>{content}</SiteChrome> : content
}
