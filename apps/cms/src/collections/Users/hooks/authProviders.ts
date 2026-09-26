import type {
  CollectionAfterLogoutHook,
  CollectionBeforeLoginHook,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
} from 'payload'
import { AuthenticationError, Forbidden } from 'payload'

import type { User } from '@digio/payload-types'

/**
 * Local login (e-mail/password) is only for local accounts. The error is the same as a wrong
 * password, so the response does not reveal which accounts use SSO.
 */
export const blockSsoUsersFromLocalLogin: CollectionBeforeLoginHook<User> = ({ req, user }) => {
  if (user.authProvider === 'sso') throw new AuthenticationError(req.t)
  return user
}

/**
 * Password recovery only applies to local accounts: for SSO accounts no e-mail is sent, and
 * the response stays the same so it does not reveal which accounts use SSO.
 */
export const restrictPasswordRecoveryToLocal: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  if (operation === 'forgotPassword') {
    const email = typeof args.data?.email === 'string' ? args.data.email.toLowerCase() : null
    if (!email) return args

    const { docs } = await req.payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: { email: { equals: email } },
    })
    if (docs[0]?.authProvider === 'sso') return { ...args, disableEmail: true }
  }

  if (operation === 'resetPassword') {
    const token = typeof args.data?.token === 'string' ? args.data.token : null
    if (!token) return args

    const { docs } = await req.payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: { resetPasswordToken: { equals: token } },
    })
    if (docs[0]?.authProvider === 'sso') throw new Forbidden(req.t)
  }

  return args
}

/**
 * E-mail and password of SSO accounts are managed by the identity provider. Only the SSO
 * provisioning (context.ssoProvisioning) may write them.
 */
export const guardSsoManagedFields: CollectionBeforeValidateHook<User> = ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || context.ssoProvisioning || originalDoc?.authProvider !== 'sso') {
    return data
  }

  const emailChanged =
    typeof data?.email === 'string' &&
    data.email.toLowerCase() !== (originalDoc.email ?? '').toLowerCase()
  const passwordChanged = typeof (data as { password?: unknown })?.password === 'string'

  if (emailChanged || passwordChanged) throw new Forbidden(req.t)

  return data
}

/**
 * Logging out through Payload (logout view, inactivity) cannot clear the SSO cookie, so the
 * SSO sessions are revoked server-side instead: the strategy rejects sessions whose version
 * no longer matches.
 */
export const revokeSsoSessionsOnLogout: CollectionAfterLogoutHook = async ({ req }) => {
  const user = req.user as (User & { collection?: string }) | null
  if (!user || user.authProvider !== 'sso') return

  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { ssoSessionVersion: (user.ssoSessionVersion ?? 0) + 1 },
    context: { ssoProvisioning: true },
    overrideAccess: true,
    req,
  })
}
