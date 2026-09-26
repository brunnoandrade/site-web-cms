import type { CollectionBeforeChangeHook, FieldAccess } from 'payload'

import { isSuperAdmin } from '../../../access/roles'

type RolesData = { roles?: string[] | null; enableAPIKey?: boolean | null }

const REVOKING = 'revokingAPIKey'

const isServiceAccount = (data?: RolesData | null) => Boolean(data?.roles?.includes('preview'))

/**
 * API keys authenticate without login, password lockout or SSO, so they are reserved for service
 * accounts (role `preview`, used by apps/web to read drafts) and managed only by super-admins.
 * The admin shows the API key controls only when this returns true.
 */
export const canManageAPIKey: FieldAccess = ({ req, data, doc }) => {
  if (req.context?.[REVOKING]) return true
  if (!isSuperAdmin(req.user)) return false
  const roles = (data as RolesData | undefined)?.roles ?? (doc as RolesData | undefined)?.roles
  return isServiceAccount({ roles })
}

/** An account that stops being a service account loses its API key. */
export const revokeAPIKeyOfNonServiceAccounts: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  const roles = data.roles ?? originalDoc?.roles
  const hasKey = data.enableAPIKey ?? originalDoc?.enableAPIKey
  if (hasKey && !isServiceAccount({ roles })) {
    req.context[REVOKING] = true
    // apiKeyIndex is what Payload looks the key up by: clearing it is what revokes the key.
    return { ...data, enableAPIKey: false, apiKey: null, apiKeyIndex: null }
  }
  return data
}
