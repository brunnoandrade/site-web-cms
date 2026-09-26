import { revalidatePath, revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'

import { invalidateRedirects } from '@/lib/redirects'

type Body = {
  paths?: unknown
  tags?: unknown
}

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

/**
 * Revalidation webhook called by the CMS after content is published or deleted
 * (see apps/cms/src/utilities/revalidateWeb.ts). Authenticated with REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ revalidated: false, message: 'Unauthorized' }, { status: 401 })
  }

  let body: Body

  try {
    body = (await req.json()) as Body
  } catch {
    return Response.json({ revalidated: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const paths = asStrings(body.paths)
  const tags = asStrings(body.tags)

  // expire: 0 so the next visit gets the new content instead of a stale copy.
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  for (const path of paths) revalidatePath(path)

  // The proxy keeps redirects in memory: drop the tenant's table ('<tenant>:redirects').
  for (const tag of tags) {
    const match = /^(.+):redirects$/.exec(tag)
    if (match) invalidateRedirects(match[1])
    if (tag === 'cms') invalidateRedirects()
  }

  return Response.json({ revalidated: true, paths, tags, now: Date.now() })
}
