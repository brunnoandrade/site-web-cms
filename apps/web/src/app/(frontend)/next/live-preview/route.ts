import { draftMode } from 'next/headers'

import { getCMSURL } from '@/lib/cms'

/**
 * Same-origin relay for the live preview. The browser cannot call the CMS directly: each
 * tenant's site has its own origin (e.g. campanha.localhost) and the CMS allows CORS only for
 * a fixed list of origins, so every tenant but the first one was blocked. The relay asks the
 * CMS (server to server, with the preview service key) to merge the unsaved form data into
 * the page, which is what `useLivePreview` needs. It reads only, and only in draft mode.
 */
const MAX_DEPTH = 2

export async function POST(request: Request): Promise<Response> {
  const { isEnabled } = await draftMode()
  if (!isEnabled || !process.env.CMS_API_KEY) {
    return Response.json({ error: 'Not in preview' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as {
    id?: unknown
    data?: unknown
    depth?: unknown
    locale?: unknown
  } | null
  const id = body?.id
  if (!body || (typeof id !== 'string' && typeof id !== 'number') || !/^[\w-]+$/.test(String(id))) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const depth = Math.min(Math.max(Number(body.depth) || 0, 0), MAX_DEPTH)

  const res = await fetch(`${getCMSURL()}/api/pages/${encodeURIComponent(String(id))}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Payload-HTTP-Method-Override': 'GET',
      Authorization: `users API-Key ${process.env.CMS_API_KEY}`,
    },
    body: JSON.stringify({
      data: body.data,
      depth,
      flattenLocales: false,
      locale: body.locale,
    }),
  })

  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
