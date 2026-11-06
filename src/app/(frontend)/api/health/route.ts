import { NextResponse } from 'next/server'

// Always answered by the running process, never prerendered or cached.
export const dynamic = 'force-dynamic'

/**
 * GET /api/health: liveness probe. Only confirms that Next.js processes an HTTP request: it does
 * not touch the database, Payload, S3 or any external API, so a dependency outage does not make
 * the orchestrator restart a healthy process. For the database see /api/health/ready.
 *
 * Public: the proxy skips /api and no authentication applies here.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'UP', service: 'web-platform', timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
