/**
 * Logic of scripts/validate-urls.ts (pure, testable with a fake fetch).
 *
 * An URL is OK when it answers 200 directly, or 301 to a destination that answers 200 (one hop,
 * no chain), keeping the query string.
 */

export type Check = {
  url: string
  ok: boolean
  status?: number
  location?: string
  finalStatus?: number
  reason: string
}

export type Fetcher = (url: string) => Promise<{ status: number; location: string | null }>

/** Probe parameter added to every URL to check the query string survives redirects. */
export const PROBE = { key: 'utm_source', value: 'validacao-urls' }

export const withProbe = (url: string): string => {
  const parsed = new URL(url)
  if (!parsed.searchParams.has(PROBE.key)) parsed.searchParams.append(PROBE.key, PROBE.value)
  return parsed.toString()
}

/** Points an URL from the list at another environment, keeping path and query. */
export const rebase = (url: string, base?: string): string => {
  if (!base) return new URL(url).toString()
  const source = new URL(url, base)
  const target = new URL(base)
  target.pathname = source.pathname
  target.search = source.search
  return target.toString()
}

const isRedirect = (status: number) => status >= 300 && status < 400

const lostParams = (from: string, to: string): string[] => {
  const source = new URL(from).searchParams
  const target = new URL(to).searchParams
  return [...source.keys()].filter((key) => target.get(key) !== source.get(key))
}

export async function checkUrl(url: string, fetcher: Fetcher): Promise<Check> {
  let first
  try {
    first = await fetcher(url)
  } catch (err) {
    return { url, ok: false, reason: `erro de rede: ${(err as Error).message}` }
  }

  if (first.status === 200) return { url, ok: true, status: 200, reason: '200' }

  if (!isRedirect(first.status)) {
    return { url, ok: false, status: first.status, reason: `respondeu ${first.status}` }
  }

  if (!first.location) {
    return {
      url,
      ok: false,
      status: first.status,
      reason: `${first.status} sem cabeçalho Location`,
    }
  }

  const location = new URL(first.location, url).toString()
  const base = { url, status: first.status, location }

  if (first.status !== 301) {
    const addsSlash = new URL(location).pathname === `${new URL(url).pathname}/`
    return {
      ...base,
      ok: false,
      reason: addsSlash
        ? `${first.status} só para acrescentar a barra final: use a URL com "/" no fim`
        : `redirect ${first.status}, deveria ser 301`,
    }
  }

  const lost = lostParams(url, location)
  if (lost.length > 0) {
    return { ...base, ok: false, reason: `o redirect perdeu a query string (${lost.join(', ')})` }
  }

  let second
  try {
    second = await fetcher(location)
  } catch (err) {
    return { ...base, ok: false, reason: `destino com erro de rede: ${(err as Error).message}` }
  }

  if (second.status === 200) return { ...base, ok: true, finalStatus: 200, reason: '301 → 200' }

  if (isRedirect(second.status)) {
    return {
      ...base,
      ok: false,
      finalStatus: second.status,
      reason: `redirect em cadeia: 301 → ${second.status} ${second.location ?? ''}`.trim(),
    }
  }

  return {
    ...base,
    ok: false,
    finalStatus: second.status,
    reason: `destino respondeu ${second.status}`,
  }
}

/** Reads URLs from a CSV/TXT: column "url"/"origem"/"from", or the first column. */
export const readUrlList = (content: string): string[] => {
  const lines = content
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) return []

  const delimiter = lines[0]!.includes(';') ? ';' : ','
  const cells = (line: string) =>
    line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ''))
  const header = cells(lines[0]!).map((cell) => cell.toLowerCase())
  const hasHeader = !header.some((cell) => /^(https?:\/\/|\/)/.test(cell))
  const column = hasHeader
    ? Math.max(
        0,
        header.findIndex((cell) => ['url', 'origem', 'from'].includes(cell)),
      )
    : 0

  return (hasHeader ? lines.slice(1) : lines)
    .map((line) => cells(line)[column] ?? '')
    .filter(Boolean)
}
