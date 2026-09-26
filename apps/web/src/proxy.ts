import { isFilePath } from '@digio/routes'
import { NextResponse, type NextRequest } from 'next/server'

import { getRedirectRules, matchRedirect } from './lib/redirects'
import { resolveTenantSlug } from './lib/tenantResolver'

/**
 * Entry point of every page request:
 * 1. resolves the request host to a tenant;
 * 2. answers the tenant's redirects (301/302), keeping the query string;
 * 3. adds the trailing slash (after the redirects, so an old URL without "/" takes one hop);
 * 4. rewrites to the internal `/<tenant>/...` routes (app/(frontend)/[tenant]).
 */
export async function proxy(request: NextRequest) {
  // Behind the CDN the original host may come in X-Forwarded-Host.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''

  let tenant: string | null
  try {
    tenant = await resolveTenantSlug(host)
  } catch {
    return new NextResponse('Serviço temporariamente indisponível.', { status: 503 })
  }

  if (!tenant) {
    return new NextResponse('Site não encontrado.', { status: 404 })
  }

  const { pathname, search } = request.nextUrl

  const redirect = matchRedirect(await getRedirectRules(tenant), pathname, search)
  if (redirect) {
    return NextResponse.redirect(new URL(redirect.location, request.nextUrl), redirect.status)
  }

  // trailingSlash is handled here (skipTrailingSlashRedirect in next.config.ts).
  if (!pathname.endsWith('/') && !isFilePath(pathname)) {
    // A plain URL: NextURL would re-apply its own trailing-slash formatting and drop the "/".
    return NextResponse.redirect(new URL(`${pathname}/${search}`, request.nextUrl.origin), 308)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${tenant}${pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  // Everything except Next.js internals, the website's own endpoints and static files.
  matcher: ['/((?!_next/|api/|next/|brand/|favicon\\.ico|favicon\\.svg|website-template-OG\\.webp).*)'],
}
