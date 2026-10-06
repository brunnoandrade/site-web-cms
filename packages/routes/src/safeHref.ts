/**
 * Whether a link typed by an editor is safe to render in an `href` or to redirect to.
 *
 * Allowlist, not blocklist: site-relative paths, `#anchors`, and absolute URLs with an allowed
 * scheme. Rejects `javascript:`, `data:`, `vbscript:`, protocol-relative `//host` and `/\host`
 * (browsers read the backslash as a slash), and any control character (browsers drop tabs and
 * newlines inside URLs, so `java\nscript:` would otherwise slip through).
 */

const WEB_SCHEMES = ['http:', 'https:']
const LINK_SCHEMES = [...WEB_SCHEMES, 'mailto:', 'tel:']

export const isSafeHref = (value: unknown, { web = false }: { web?: boolean } = {}): boolean => {
  if (typeof value !== 'string') return false
  const href = value.trim()
  // eslint-disable-next-line no-control-regex
  if (!href || /[\u0000-\u001f\u007f\s]/.test(href)) return false

  if (href.startsWith('#') || href.startsWith('?')) return !web
  if (href.startsWith('/')) return !/^\/[/\\]/.test(href)

  try {
    return (web ? WEB_SCHEMES : LINK_SCHEMES).includes(new URL(href).protocol)
  } catch {
    return false
  }
}

/** Validation message for Payload text fields holding a link; `true` when valid or empty. */
export const hrefValidationMessage = (
  value: unknown,
  options: { web?: boolean } = {},
): true | string =>
  !value || isSafeHref(value, options)
    ? true
    : 'Use um caminho do site (/pagina/), http(s)://, mailto: ou tel:.'
