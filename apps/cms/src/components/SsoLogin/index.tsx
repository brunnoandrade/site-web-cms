import React from 'react'

import { isLocalAuthEnabled, isSsoEnabled, ssoRoutes } from '@/auth/config'
import { SsoLoginClient } from './SsoLoginClient'

/** "Entrar com SSO" on the admin login page, when SSO is enabled in this environment. */
export const SsoLogin: React.FC = () => {
  if (!isSsoEnabled()) return null

  return <SsoLoginClient loginHref={ssoRoutes.login} showDivider={isLocalAuthEnabled()} />
}

export default SsoLogin
