import { NextResponse } from 'next/server'

import type { SsoErrorCode } from './provisionSsoUser'
import { getSsoSettings } from './config'

const serverURL = () => {
  try {
    return getSsoSettings().serverURL
  } catch {
    return process.env.SERVER_URL || 'http://localhost:3001'
  }
}

export const cookieOptions = (url: string) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: url.startsWith('https://'),
})

/** Back to the admin login page with an error code (shown by the SSO login button). */
export const loginPageWithError = (code: SsoErrorCode) =>
  NextResponse.redirect(`${serverURL()}/admin/login?sso_error=${code}`)
