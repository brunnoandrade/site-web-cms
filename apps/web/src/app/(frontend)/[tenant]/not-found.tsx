import Link from 'next/link'
import React from 'react'

import { SiteChrome } from '@/components/SiteChrome'
import { Button } from '@/components/ui/button'
import { getCurrentTenant } from '@/lib/currentTenant'

// notFound() has no route params and no request access (see lib/currentTenant.ts), so the tenant
// comes from the layout. Without one the 404 renders without menu and footer.
export default function NotFound() {
  const tenant = getCurrentTenant()

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
