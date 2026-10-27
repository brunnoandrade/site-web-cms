import 'server-only'

import { cache } from 'react'

const holder = cache(() => ({ slug: null as string | null }))

/**
 * Tenant of the request being rendered, set by the `[tenant]` layout. `not-found.tsx` has no route
 * params and may not read the request (`headers()`, uncached fetches): Next.js renders it while
 * prerendering every page, where those calls fail. The layout always runs before its children.
 */
export const setCurrentTenant = (slug: string) => {
  holder().slug = slug
}

export const getCurrentTenant = () => holder().slug
