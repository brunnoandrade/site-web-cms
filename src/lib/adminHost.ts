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
