import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { redirects } from './redirects'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// The CMS admin embeds the site in its live preview.
const cmsURL = new URL(process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001')

// Public media storage (MinIO locally, CDN in higher environments).
const mediaURL = new URL(process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:9200')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Only the CMS admin may embed the site (live preview); everyone else is refused.
  { key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${cmsURL.origin}` },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: mediaURL.protocol.replace(':', '') as 'http' | 'https',
        hostname: mediaURL.hostname,
        port: mediaURL.port,
        pathname: `${mediaURL.pathname.replace(/\/$/, '')}/**`,
      },
    ],
    qualities: [75, 100],
    // Local development only: MinIO runs on localhost, which Next.js blocks by default.
    dangerouslyAllowLocalIP: process.env.IMAGES_ALLOW_LOCAL_IP === 'true',
  },
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
  reactStrictMode: true,
  // The trailing slash is a per-property policy (tenant `trailingSlash`, see lib/urlPolicy.ts and
  // packages/routes), answered by the proxy. Next must not impose one: with `trailingSlash: true`
  // it would also add "/" to every canonical URL, even for properties whose URLs have none.
  trailingSlash: false,
  // Title and meta tags always inside <head> (the current site renders them there for every client),
  // not streamed into the body for browsers: crawlers and link previews that do not run scripts
  // then see them too.
  htmlLimitedBots: /.*/,
  skipTrailingSlashRedirect: true,
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: 'standalone',
  outputFileTracingRoot: path.resolve(dirname, '../..'),
  redirects,
  turbopack: {
    root: path.resolve(dirname, '../..'),
  },
}

export default nextConfig
