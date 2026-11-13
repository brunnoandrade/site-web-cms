import { webManifest } from '@/lib/manifest'
import { requireTenant } from '@/lib/tenant'

/** /manifest.webmanifest of each tenant. */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const tenant = await requireTenant((await params).tenant)
  return new Response(JSON.stringify(webManifest(tenant)), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  })
}
