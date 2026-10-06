import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Short-lived token that opens a preview. Replaces a static shared secret in the preview URL:
 * the URL is shown to every editor in the admin, so a static secret would let any editor open
 * drafts of any other tenant. The token is bound to one host and one path and expires.
 *
 * Server-side only (node:crypto): import from '@digio/routes/preview-token', not the index,
 * so the website proxy bundle does not pull it in.
 */

export const PREVIEW_TOKEN_TTL_SECONDS = 30 * 60

const sign = (secret: string, host: string, path: string, exp: number): string =>
  createHmac('sha256', secret).update(`preview\n${host}\n${path}\n${exp}`).digest('base64url')

/** `host` is the site's host as the browser sends it (e.g. "www.digio.com.br"). */
export const createPreviewToken = (
  secret: string,
  { host, path }: { host: string; path: string },
  now = Date.now(),
): string => {
  const exp = Math.floor(now / 1000) + PREVIEW_TOKEN_TTL_SECONDS
  return `${exp}.${sign(secret, host.toLowerCase(), path, exp)}`
}

export const verifyPreviewToken = (
  secret: string | undefined,
  token: string | null | undefined,
  { host, path }: { host: string; path: string },
  now = Date.now(),
): boolean => {
  if (!secret || !token) return false

  const [expRaw, signature, ...rest] = token.split('.')
  const exp = Number(expRaw)
  if (!signature || rest.length > 0 || !Number.isInteger(exp)) return false
  if (exp * 1000 < now) return false

  const expected = Buffer.from(sign(secret, host.toLowerCase(), path, exp))
  const received = Buffer.from(signature)
  return expected.length === received.length && timingSafeEqual(expected, received)
}
