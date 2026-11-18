/**
 * Host that may serve the CMS (/admin and the SSO routes), set by ADMIN_HOST.
 * Empty means no restriction (local development): the admin answers on every domain.
 *
 * A value without a port (admin.digio.com.br) matches the host whatever the port;
 * a value with a port (localhost:3000) must match it exactly.
 */
const normalize = (value: string) => value.trim().toLowerCase()

export function isAdminHostAllowed(host: string, adminHost: string | undefined): boolean {
  const allowed = normalize(adminHost ?? '')
  if (!allowed) return true

  const current = normalize(host)
  if (allowed.includes(':')) return current === allowed
  return current.split(':')[0] === allowed
}

/** True when ADMIN_HOST is set and `host` is that host. */
export function isAdminHost(host: string, adminHost: string | undefined): boolean {
  return Boolean(normalize(adminHost ?? '')) && isAdminHostAllowed(host, adminHost)
}

/**
 * API routes that the public site (or the platform probes and the app itself) call on any host.
 * Every other /api route is Payload's REST API (login, writes, drafts) and answers only on the
 * admin host, so a tenant's public domain does not expose it.
 */
const publicApiPaths = ['/api/health', '/api/health/ready', '/api/help-suggest', '/api/revalidate']

export function isPublicApiPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return publicApiPaths.includes(path)
}
