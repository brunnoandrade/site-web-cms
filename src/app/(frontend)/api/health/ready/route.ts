import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health/ready: readiness probe. 200 when the database answers, 503 otherwise, so the
 * load balancer stops sending traffic without restarting the process (that is /api/health).
 * Public, no data.
 */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }
  const service = 'web-platform'
  try {
    const payload = await getPayload({ config })
    await payload.db.drizzle.execute('select 1')
    return NextResponse.json(
      { status: 'UP', service, timestamp: new Date().toISOString() },
      { headers },
    )
  } catch {
    return NextResponse.json(
      { status: 'DOWN', service, timestamp: new Date().toISOString() },
      { status: 503, headers },
    )
  }
}
