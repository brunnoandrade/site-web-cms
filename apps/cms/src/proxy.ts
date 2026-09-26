import { NextResponse, type NextRequest } from 'next/server'

/**
 * Admin defaults: Portuguese and light theme. Payload reads both from cookies and otherwise
 * follows the browser (Accept-Language, prefers-color-scheme). The cookies are only set when
 * missing, so a user who picks English or the dark theme in their account keeps that choice.
 */
const defaults = {
  'payload-lng': 'pt',
  'payload-theme': 'light',
} as const

export function proxy(request: NextRequest) {
  const missing = Object.entries(defaults).filter(([name]) => !request.cookies.has(name))
  if (missing.length === 0) return NextResponse.next()

  // Also applies to this request, so the first render already uses the defaults.
  for (const [name, value] of missing) request.cookies.set(name, value)
  const response = NextResponse.next({ request: { headers: request.headers } })

  for (const [name, value] of missing) {
    response.cookies.set(name, value, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  }
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
