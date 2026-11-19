/**
 * Origins allowed to embed the site: the admin's live preview iframe.
 *
 * The admin lives on its own origin (ADMIN_HOST / SERVER_URL) and each tenant's site on another
 * (e.g. uberconta.localhost), so 'self' alone would block the preview. Read at request time by
 * the proxy, not in next.config.ts, which Next evaluates at build: one image serves every
 * environment.
 */
export function frameAncestors(env: { SERVER_URL?: string; ADMIN_HOST?: string }): string {
  const origin = (url: string | undefined) => {
    try {
      return url ? [new URL(url).origin] : []
    } catch {
      return []
    }
  }
  const adminHost = env.ADMIN_HOST?.trim()
  return [
    "'self'",
    ...new Set([...origin(env.SERVER_URL), ...(adminHost ? [`https://${adminHost}`] : [])]),
  ].join(' ')
}
