import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { redirects } from './redirects'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Public media storage (MinIO locally, CDN in higher environments).
const mediaURL = new URL(process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:9000')

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
    qualities: [100],
    // Local development only: MinIO runs on localhost, which Next.js blocks by default.
    dangerouslyAllowLocalIP: process.env.IMAGES_ALLOW_LOCAL_IP === 'true',
  },
  reactStrictMode: true,
  // Current site URLs end with '/'; keep them identical to avoid redirects and SEO loss.
  trailingSlash: true,
  // The proxy adds the trailing slash itself, after answering redirects, so an old URL
  // without "/" is redirected in one hop (src/proxy.ts).
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
