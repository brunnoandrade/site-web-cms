import { requireTenant } from '@/lib/tenant'

/** robots.txt of each tenant, pointing to its own sitemap index. */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)

  const body = [
    'User-agent: *',
    'Disallow: /next/',
    'Disallow: /api/',
    '',
    `Sitemap: ${tenant.siteUrl}/sitemap.xml`,
    '',
  ].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
