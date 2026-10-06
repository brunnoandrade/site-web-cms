import { lookup } from 'dns/promises'
import { isIP } from 'net'

/**
 * Fetches images referenced by WordPress content without letting that content aim the request
 * at the network the migration runs in (SSRF): post authors control `<img src>` and og:image.
 *
 * - only http(s);
 * - the host must resolve to public addresses (no loopback, private, link-local or cloud
 *   metadata ranges), unless it is one of the trusted origins (the WordPress source and the
 *   tenant's own site);
 * - redirects are followed by hand, re-checking every hop;
 * - the response size is capped.
 */

export const MAX_IMAGE_BYTES = 50 * 1024 * 1024
const MAX_REDIRECTS = 3

const ipv4IsPrivate = (ip: string): boolean => {
  const [a, b] = ip.split('.').map(Number) as [number, number]
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast and reserved
  )
}

export const isPrivateAddress = (address: string): boolean => {
  const ip = address.toLowerCase()
  if (isIP(ip) === 4) return ipv4IsPrivate(ip)

  // IPv6, including IPv4-mapped (::ffff:10.0.0.1).
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(ip)
  if (mapped) return ipv4IsPrivate(mapped[1]!)

  return (
    ip === '::' ||
    ip === '::1' ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip.startsWith('fe8') ||
    ip.startsWith('fe9') ||
    ip.startsWith('fea') ||
    ip.startsWith('feb') ||
    ip.startsWith('ff')
  )
}

type Resolve = (host: string) => Promise<{ address: string }[]>

const defaultResolve: Resolve = (host) => lookup(host, { all: true })

/** Throws unless `url` is an http(s) URL on a trusted origin or on a public address. */
export async function assertFetchable(
  url: string,
  trustedOrigins: string[],
  resolve: Resolve = defaultResolve,
): Promise<void> {
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`protocolo não permitido: ${parsed.protocol}`)
  }
  if (trustedOrigins.includes(parsed.origin)) return

  const host = parsed.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) {
    throw new Error(`endereço interno não permitido: ${host}`)
  }

  const addresses = isIP(host) ? [{ address: host }] : await resolve(host)
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error(`o host ${host} aponta para um endereço interno ou não resolve`)
  }
}

type FetchImageOptions = {
  trustedOrigins: string[]
  fetch?: typeof fetch
  headers?: Record<string, string>
  resolve?: Resolve
  maxBytes?: number
}

export async function fetchPublicImage(
  url: string,
  {
    trustedOrigins,
    fetch: http = fetch,
    headers,
    resolve,
    maxBytes = MAX_IMAGE_BYTES,
  }: FetchImageOptions,
): Promise<{ data: Buffer; contentType: string | null }> {
  let current = url

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertFetchable(current, trustedOrigins, resolve)

    const res = await http(current, {
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    })

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) throw new Error(`redirect sem destino em ${current}`)
      current = new URL(location, current).toString()
      continue
    }

    if (!res.ok) throw new Error(`imagem ${current} respondeu ${res.status}`)

    const declared = Number(res.headers.get('content-length'))
    if (declared > maxBytes) throw new Error(`imagem ${current} grande demais (${declared} bytes)`)

    const data = Buffer.from(await res.arrayBuffer())
    if (data.byteLength > maxBytes) throw new Error(`imagem ${current} grande demais`)

    return { data, contentType: res.headers.get('content-type') }
  }

  throw new Error(`redirects demais ao buscar ${url}`)
}
