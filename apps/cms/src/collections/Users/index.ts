import type { Access, CollectionConfig, Where } from 'payload'

import {
  canAccessAdmin,
  getTenantIDsWithRoles,
  isSuperAdmin,
  superAdminOnly,
} from '../../access/roles'
import { isLocalAuthEnabled, isSsoEnabled } from '../../auth/config'
import { ssoStrategy } from '../../auth/strategy'
import {
  blockSsoUsersFromLocalLogin,
  guardSsoManagedFields,
  restrictPasswordRecoveryToLocal,
  revokeSsoSessionsOnLogout,
} from './hooks/authProviders'
import { canManageAPIKey, revokeAPIKeyOfNonServiceAccounts } from './hooks/apiKey'
import { guardOtherUserUpdates, validateTenantAssignments } from './hooks/validateTenantAssignments'

/**
 * Super-admins manage every user. Tenant admins manage users of their tenants.
 * Everyone else only sees and edits their own account.
 */
const selfOrTenantAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true

  const adminTenantIDs = getTenantIDsWithRoles(user, ['admin'])
  const self: Where = { id: { equals: user.id } }

  return adminTenantIDs.length > 0
    ? { or: [self, { 'tenants.tenant': { in: adminTenantIDs } }] }
    : self
}

const superAdminOrTenantAdmin: Access = ({ req: { user } }) =>
  isSuperAdmin(user) || getTenantIDsWithRoles(user, ['admin']).length > 0

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  access: {
    admin: canAccessAdmin,
    create: superAdminOrTenantAdmin,
    delete: superAdminOnly,
    read: selfOrTenantAdmin,
    update: selfOrTenantAdmin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
    group: 'Plataforma',
  },
  auth: {
    // Lets apps/web read drafts for preview with a service user's API key (CMS_API_KEY).
    // Restricted to service accounts and super-admins: see the `apiKey` field below.
    useAPIKey: true,
    // Local (e-mail/password) login can be switched off per environment (off in PRD).
    // The auth fields stay in the schema so the database is the same in every environment.
    ...(isLocalAuthEnabled()
      ? {}
      : { disableLocalStrategy: { enableFields: true, optionalPassword: true } as const }),
    // SSO (RH-SSO/Keycloak): its own session cookie and its own logout (see src/auth).
    strategies: isSsoEnabled() ? [ssoStrategy] : [],
  },
  fields: [
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
    },
    {
      // Which authenticator this account uses. Fixed at creation: accounts created in the
      // admin are local; SSO accounts are created on their first SSO login.
      name: 'authProvider',
      label: 'Autenticação',
      type: 'select',
      defaultValue: 'local',
      options: [
        { label: 'Login local (e-mail e senha)', value: 'local' },
        { label: 'SSO corporativo', value: 'sso' },
      ],
      saveToJWT: true,
      admin: { position: 'sidebar', readOnly: true },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      // Subject (`sub`) of the SSO identity linked to this account.
      name: 'ssoSubject',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => data?.authProvider === 'sso',
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      // Bumped on logout to revoke the user's SSO sessions (see auth/strategy.ts).
      name: 'ssoSessionVersion',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
      access: {
        read: () => false,
        create: () => false,
        update: () => false,
      },
    },
    {
      // IdP refresh token (AES-GCM encrypted): lets the strategy re-check the user against the
      // IdP, so removing a group or disabling the user there ends the CMS session.
      name: 'ssoRefreshToken',
      type: 'text',
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    {
      name: 'ssoSyncedAt',
      type: 'date',
      admin: { hidden: true },
      access: { read: () => false, create: () => false, update: () => false },
    },
    {
      name: 'roles',
      label: 'Papéis na plataforma',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      options: [
        { label: 'Super admin (todas as propriedades)', value: 'super-admin' },
        { label: 'Leitor de preview (conta de serviço)', value: 'preview' },
      ],
      admin: {
        description:
          'Deixe vazio para usuários comuns: o acesso deles vem dos papéis em cada propriedade.',
      },
      access: {
        create: ({ req: { user } }) => isSuperAdmin(user),
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
    },
    {
      // Overrides the access of Payload's API key fields (enableAPIKey, apiKey, apiKeyIndex).
      name: 'apiKey',
      type: 'text',
      access: { create: canManageAPIKey, update: canManageAPIKey },
    },
  ],
  hooks: {
    afterLogout: [revokeSsoSessionsOnLogout],
    beforeLogin: [blockSsoUsersFromLocalLogin],
    beforeChange: [revokeAPIKeyOfNonServiceAccounts],
    beforeOperation: [restrictPasswordRecoveryToLocal],
    beforeValidate: [guardSsoManagedFields, guardOtherUserUpdates, validateTenantAssignments],
  },
  timestamps: true,
}
