import * as client from 'openid-client'

import { getSsoSettings, ssoRoutes } from './config'

let configuration: Promise<client.Configuration> | null = null

/**
 * OIDC client configuration from the issuer's discovery document (cached per process).
 * Plain-http issuers are only accepted outside production builds (local Keycloak).
 */
export const getOidcConfiguration = (): Promise<client.Configuration> => {
  if (!configuration) {
    const { issuer, clientId, clientSecret } = getSsoSettings()
    const allowHttp = issuer.protocol === 'http:' && process.env.NODE_ENV !== 'production'

    configuration = client
      .discovery(issuer, clientId, clientSecret, undefined, {
        execute: allowHttp ? [client.allowInsecureRequests] : [],
      })
      .catch((err) => {
        // Do not cache failures: retry discovery on the next login.
        configuration = null
        throw err
      })
  }
  return configuration
}

export const getRedirectURI = () => `${getSsoSettings().serverURL}${ssoRoutes.callback}`

export { client }
