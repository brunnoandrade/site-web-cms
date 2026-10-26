import { requireTenant } from '@/lib/tenant'

/** /llms.txt of each property: the guide for AI assistants, written in the admin (tenant.llmsTxt). */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const tenant = await requireTenant((await params).tenant)
  if (!tenant.llmsTxt?.trim()) return new Response('Not found', { status: 404 })

  const body = tenant.llmsTxt.replaceAll('{{siteUrl}}', tenant.siteUrl).trim() + '\n'
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
