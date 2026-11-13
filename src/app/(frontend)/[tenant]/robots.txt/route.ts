import { robotsTxt } from '@/lib/robots'
import { requireTenant } from '@/lib/tenant'

/** robots.txt of each tenant, pointing to its own sitemap index. */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const tenant = await requireTenant((await params).tenant)
  return new Response(robotsTxt(tenant), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
