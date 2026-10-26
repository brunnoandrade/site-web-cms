import type { NextRequest } from 'next/server'

import { resolveTenant } from '@/lib/tenantResolver'
import { searchFaqs } from '@/lib/uber-help'

const LIMIT = 5

/**
 * Suggestions for the help center search box: the first questions (in the CMS order) whose text
 * or answer contains every word typed. The property comes from the request host, like the pages.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const query = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100)
  const tenant = await resolveTenant(
    req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '',
  )
  if (!tenant || !query) return Response.json({ items: [] })

  const faqs = await searchFaqs(tenant.slug, query)
  return Response.json(
    { items: faqs.slice(0, LIMIT).map(({ question, slug }) => ({ question, slug })) },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
