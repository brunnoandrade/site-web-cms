import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

// Only same-site relative paths ("/foo/"), never protocol-relative ("//evil.com") URLs.
const isSafeRelativePath = (path: string) => path.startsWith('/') && !path.startsWith('//')

/**
 * Entry point for previews opened from the CMS admin (see generatePreviewPath in apps/cms).
 * Enables Next.js draft mode; draft content is then fetched with CMS_API_KEY.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const path = req.nextUrl.searchParams.get('path')
  const previewSecret = req.nextUrl.searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path || !isSafeRelativePath(path)) {
    return new Response('Invalid preview path', { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
