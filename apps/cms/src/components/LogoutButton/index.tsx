'use client'

import { Logout, LogOutIcon, useAuth } from '@payloadcms/ui'
import React from 'react'

import type { User } from '@digio/payload-types'

/**
 * Each authenticator has its own logout:
 * - local accounts: Payload's logout (ends the local session only);
 * - SSO accounts: POST /auth/sso/logout, which also ends the RH-SSO/Keycloak session.
 */
export const LogoutButton: React.FC<{ tabIndex?: number }> = ({ tabIndex = 0 }) => {
  const { user } = useAuth<User>()

  if (user?.authProvider !== 'sso') return <Logout tabIndex={tabIndex} />

  return (
    <form action="/auth/sso/logout" method="post" style={{ display: 'contents' }}>
      <button
        aria-label="Sair (SSO)"
        className="nav__log-out"
        style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, color: 'inherit' }}
        tabIndex={tabIndex}
        title="Sair (SSO)"
        type="submit"
      >
        <LogOutIcon />
      </button>
    </form>
  )
}

export default LogoutButton
