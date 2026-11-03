'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

import './index.scss'

const errorMessages: Record<string, string> = {
  sso_disabled: 'O login pelo SSO está desativado neste ambiente.',
  sso_failed: 'Não foi possível concluir o login pelo SSO. Tente novamente.',
  invalid_claims: 'O SSO não enviou os dados necessários (e-mail).',
  email_not_verified: 'Seu e-mail não está verificado no SSO.',
  local_account: 'Este e-mail pertence a uma conta de login local. Entre com e-mail e senha.',
  subject_mismatch:
    'Este e-mail já está vinculado a outra identidade do SSO. Procure um administrador.',
  no_access: 'Seu usuário do SSO não tem acesso a nenhuma propriedade do CMS.',
}

export const SsoLoginClient: React.FC<{ loginHref: string; showDivider: boolean }> = ({
  loginHref,
  showDivider,
}) => {
  const errorCode = useSearchParams().get('sso_error')
  const error = errorCode ? (errorMessages[errorCode] ?? errorMessages.sso_failed) : null

  return (
    <div className="sso-login">
      {showDivider && <p className="sso-login__divider">ou</p>}
      {error && (
        <p className="sso-login__error" role="alert">
          {error}
        </p>
      )}
      {/* Full page navigation: the SSO login redirects to RH-SSO/Keycloak. */}
      <a className="btn btn--style-secondary btn--size-large sso-login__button" href={loginHref}>
        Entrar com SSO corporativo
      </a>
    </div>
  )
}
