import { NextResponse, type NextRequest } from 'next/server'

import { getRedirectRules, matchRedirect } from './lib/redirects'
import { resolveTenant, type TenantInfo } from './lib/tenantResolver'
import { internalPath, policyRedirect, styledDestination } from './lib/urlPolicy'

/**
 * Entry point of every page request:
 * 1. resolves the request host to a tenant;
 * 2. answers the tenant's redirects (301/302), keeping the query string;
 * 3. applies the property's URL policy (trailing slash form, flat blog URLs; see lib/urlPolicy.ts),
 *    after the redirects, so an old URL takes one hop;
 * 4. rewrites to the internal `/<tenant>/...` routes (app/(frontend)/[tenant]).
 */
export async function proxy(request: NextRequest) {
  // Behind the CDN the original host may come in X-Forwarded-Host.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''

  let tenantInfo: TenantInfo | null
  try {
    tenantInfo = await resolveTenant(host)
  } catch {
    return new NextResponse('Serviço temporariamente indisponível.', { status: 503 })
  }

  if (!tenantInfo) {
    return new NextResponse('Site não encontrado.', { status: 404 })
  }
  const { slug: tenant, style } = tenantInfo

  const { pathname, search } = request.nextUrl

  const redirect = matchRedirect(await getRedirectRules(tenant), pathname, search)
  if (redirect) {
    return NextResponse.redirect(
      new URL(styledDestination(redirect.location, style), request.nextUrl),
      redirect.status,
    )
  }

  // trailingSlash is handled here (skipTrailingSlashRedirect in next.config.ts).
  const policy = policyRedirect(pathname, search, style)
  if (policy) {
    // A plain URL: NextURL would re-apply its own trailing-slash formatting and drop the "/".
    return NextResponse.redirect(new URL(policy.location, request.nextUrl.origin), policy.status)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${tenant}${internalPath(pathname)}`

  return NextResponse.rewrite(url)
}

export const config = {
  // Everything except Next.js internals, the website's own endpoints and static files.
  matcher: [
    '/((?!_next/|api/|next/|brand/|fonts/|favicon\\.ico|favicon\\.svg|website-template-OG\\.webp).*)',
  ],
}
