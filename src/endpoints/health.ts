import type { Endpoint } from 'payload'

/**
 * GET /api/health: readiness probe for the load balancer / orchestrator. Public, no data.
 * 200 when the database answers, 503 otherwise.
 */
export const health: Endpoint = {
  path: '/health',
  method: 'get',
  handler: async (req) => {
    const headers = { 'Cache-Control': 'no-store' }
    try {
      await req.payload.db.drizzle.execute('select 1')
      return Response.json({ status: 'ok' }, { headers })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'Health check failed' })
      return Response.json({ status: 'unavailable' }, { status: 503, headers })
    }
  },
}
