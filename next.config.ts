import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { redirects } from './redirects'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Public media storage (MinIO locally, CDN in higher environments).
const mediaURL = new URL(process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:9200')

const baseSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
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
  headers: async () => [
    {
      // The admin and the API are never embedded.
      source: '/:path(admin|api)/:rest*',
      headers: [
        ...baseSecurityHeaders,
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
      ],
    },
    {
      // The site is embedded only by the admin's live preview (same origin).
      source: '/((?!admin|api).*)',
      headers: [
        ...baseSecurityHeaders,
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
      ],
    },
  ],
  reactStrictMode: true,
  // The trailing slash is a per-property policy (tenant `trailingSlash`, see lib/urlPolicy.ts and
  // src/routes), answered by the proxy. Next must not impose one: with `trailingSlash: true`
  // it would also add "/" to every canonical URL, even for properties whose URLs have none.
  trailingSlash: false,
  // Title and meta tags always inside <head> (the current site renders them there for every client),
  // not streamed into the body for browsers: crawlers and link previews that do not run scripts
  // then see them too.
  htmlLimitedBots: /.*/,
  skipTrailingSlashRedirect: true,
  // Self-contained server bundle for the container image (see Dockerfile).
  output: 'standalone',
  redirects,
  turbopack: {
    root: dirname,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
