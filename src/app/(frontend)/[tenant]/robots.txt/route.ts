import { requireTenant } from '@/lib/tenant'

/** robots.txt of each tenant, pointing to its own sitemap index. */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)

  // Blocked properties (DEV/HML) close everything; the editor's extra rules only apply to open ones.
  const rules = tenant.blockIndexing
    ? ['Disallow: /']
    : [
        'Disallow: /next/',
        'Disallow: /api/',
        ...(tenant.robotsExtra ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      ]

  const body = ['User-agent: *', ...rules, '', `Sitemap: ${tenant.siteUrl}/sitemap.xml`, ''].join(
    '\n',
  )

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
