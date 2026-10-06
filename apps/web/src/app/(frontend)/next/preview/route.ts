import { verifyPreviewToken } from '@digio/routes/preview-token'
import { cookies, draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

// Only same-site relative paths ("/foo/"). Browsers treat "\" as "/", so "//evil.com" and
// "/\evil.com" are both protocol-relative URLs; control characters are never valid either.
const isSafeRelativePath = (path: string) =>
  path.startsWith('/') && !/^\/[/\\]/.test(path) && !/[\u0000-\u001f\u007f]/.test(path)

/**
 * Entry point for previews opened from the CMS admin (see generatePreviewPath in apps/cms).
 * Enables Next.js draft mode; draft content is then fetched with CMS_API_KEY.
 *
 * Authorized by a signed, short-lived token bound to this host and path (never the raw secret,
 * which would let an editor of one tenant open drafts of another).
 */
export async function GET(req: NextRequest): Promise<Response> {
  const path = req.nextUrl.searchParams.get('path')
  const token = req.nextUrl.searchParams.get('previewToken')

  if (!path || !isSafeRelativePath(path)) {
    return new Response('Invalid preview path', { status: 400 })
  }

  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? ''
  if (!verifyPreviewToken(process.env.PREVIEW_SECRET, token, { host, path })) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  // The admin embeds the preview in an iframe. In production Next already sends the draft cookie
  // as `SameSite=None; Secure`, but in development it sends `SameSite=Lax`, which the browser
  // drops when the iframe is cross-site (e.g. admin on localhost:3001, campaign on
  // campanha.localhost:3000), so the preview never enters draft mode. Browsers accept Secure
  // cookies on *.localhost over http.
  if (process.env.NODE_ENV !== 'production') {
    const jar = await cookies()
    const bypass = jar.get('__prerender_bypass')
    if (bypass) {
      jar.set({ ...bypass, httpOnly: true, path: '/', sameSite: 'none', secure: true })
    }
  }

  redirect(path)
}
