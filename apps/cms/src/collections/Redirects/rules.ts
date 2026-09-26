import { normalizePath } from '@digio/routes'

/**
 * Pure redirect rules (no database). The hooks in ./hooks.ts load the data and apply them.
 */

export type RedirectSummary = {
  id?: number | string
  from: string
  /** Normalized destination path on the same site, or null for external destinations. */
  destinationPath: string | null
  active?: boolean | null
}

export type RedirectRuleError = { path: string; message: string }

/**
 * Destination path of a custom URL, when it points to the same site: relative paths, or
 * absolute URLs on one of the tenant's own domains. External URLs return null.
 */
export const customDestinationPath = (url: string, tenantDomains: string[]): string | null => {
  const value = url.trim()
  if (!value) return null
  if (value.startsWith('/') && !value.startsWith('//')) return normalizePath(value)

  try {
    const parsed = new URL(value.startsWith('//') ? `https:${value}` : value)
    return tenantDomains.includes(parsed.hostname.toLowerCase())
      ? normalizePath(parsed.pathname)
      : null
  } catch {
    return null
  }
}

/**
 * Checks a redirect against the other redirects of the same tenant:
 * - no loop (A -> A);
 * - no duplicated source;
 * - no chain: the destination is not the source of another redirect (A -> B -> C), and no
 *   other redirect points to this source (X -> A -> B).
 */
export const checkRedirect = (
  redirect: RedirectSummary,
  others: RedirectSummary[],
): RedirectRuleError[] => {
  const errors: RedirectRuleError[] = []
  const rest = others.filter(
    (other) => redirect.id === undefined || String(other.id) !== String(redirect.id),
  )

  if (redirect.destinationPath && redirect.destinationPath === redirect.from) {
    errors.push({ path: 'to', message: 'O destino é igual à origem: o redirect entraria em loop.' })
  }

  if (rest.some((other) => other.from === redirect.from)) {
    errors.push({ path: 'from', message: `Já existe um redirect com a origem ${redirect.from}.` })
  }

  const next =
    redirect.destinationPath && rest.find((other) => other.from === redirect.destinationPath)
  if (next) {
    errors.push({
      path: 'to',
      message: `Redirect em cadeia: ${redirect.destinationPath} já redireciona para ${next.destinationPath ?? 'um endereço externo'}. Aponte direto para o destino final.`,
    })
  }

  const previous = rest.find((other) => other.destinationPath === redirect.from)
  if (previous) {
    errors.push({
      path: 'from',
      message: `Redirect em cadeia: ${previous.from} já redireciona para ${redirect.from}. Ajuste aquele redirect para apontar direto para o destino final.`,
    })
  }

  return errors
}
