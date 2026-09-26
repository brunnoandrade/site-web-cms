import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Tenant, User } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { provisionSsoUser, SsoLoginError } from '@/auth/provisionSsoUser'
import { ssoStrategy } from '@/auth/strategy'
import { signSsoSession, SSO_SESSION_COOKIE } from '@/auth/tokens'

/**
 * SSO provisioning, the SSO session strategy and the rules that keep each account on its own
 * authenticator. The OIDC exchange itself is covered end to end by scripts/sso-smoke.py and
 * tests/e2e/auth.e2e.spec.ts (real Keycloak).
 */

let payload: Payload
const run = `${Date.now()}`
const superAdminRole = 'cms-super-admin'
const email = (key: string) => `${key}-${run}@sso.test.local`
let tenant: Tenant

const claims = (key: string, extra: Record<string, unknown> = {}) => ({
  sub: `sub-${key}-${run}`,
  email: email(key),
  email_verified: true,
  name: key,
  groups: [`/tenants/${tenant.slug}/editor`],
  ...extra,
})

const expectSsoError = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toBeInstanceOf(SsoLoginError)
  await expect(promise).rejects.toMatchObject({ code })
}

const authenticate = async (
  user: User,
  { version, headers = {} }: { version?: number; headers?: Record<string, string> } = {},
) => {
  const token = await signSsoSession(
    { uid: String(user.id), ver: version ?? user.ssoSessionVersion ?? 0 },
    60,
  )
  const { user: authenticated } = await ssoStrategy.authenticate({
    headers: new Headers({
      cookie: `${SSO_SESSION_COOKIE}=${token}`,
      'Sec-Fetch-Site': 'same-origin',
      ...headers,
    }),
    payload,
  })
  return authenticated
}

describe('SSO', () => {
  beforeAll(async () => {
    process.env.AUTH_SSO_ENABLED = 'true'
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'SSO',
        slug: `sso-${run}`,
        siteUrl: 'http://sso.test.local',
        domains: [{ domain: `sso-${run}.local` }],
      },
    })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'users',
      where: { email: { like: `-${run}@sso.test.local` } },
    })
    await payload.delete({ collection: 'tenants', id: tenant.id })
  })

  describe('provisioning', () => {
    it('creates an SSO account with the roles from the groups', async () => {
      const user = await provisionSsoUser(payload, claims('novo'), { superAdminRole })
      expect(user.authProvider).toBe('sso')
      expect(user.ssoSubject).toBe(`sub-novo-${run}`)
      expect(
        user.tenants?.map((row) => [
          typeof row.tenant === 'object' ? row.tenant.id : row.tenant,
          row.roles,
        ]),
      ).toEqual([[tenant.id, ['editor']]])
    })

    it('recalculates roles on every login (the IdP is the source of truth)', async () => {
      const user = await provisionSsoUser(
        payload,
        claims('novo', { groups: [`/tenants/${tenant.slug}/seo`] }),
        {
          superAdminRole,
        },
      )
      expect(user.tenants?.[0]?.roles).toEqual(['seo'])
    })

    it('refuses the login when the IdP removes every group', async () => {
      await expectSsoError(
        provisionSsoUser(payload, claims('novo', { groups: [] }), { superAdminRole }),
        'no_access',
      )
    })

    it('grants super-admin through the realm role', async () => {
      const user = await provisionSsoUser(
        payload,
        claims('admin', { groups: [], roles: [superAdminRole] }),
        {
          superAdminRole,
        },
      )
      expect(user.roles).toEqual(['super-admin'])
    })

    it('never links an SSO identity to a local account with the same e-mail', async () => {
      await payload.create({
        collection: 'users',
        data: { email: email('local'), password: 'Local-12345!' },
      })
      await expectSsoError(
        provisionSsoUser(payload, claims('local'), { superAdminRole }),
        'local_account',
      )
    })

    it('refuses a second SSO identity for an e-mail already linked to another one', async () => {
      await expectSsoError(
        provisionSsoUser(
          payload,
          { ...claims('novo'), sub: `outro-sub-${run}` },
          { superAdminRole },
        ),
        'subject_mismatch',
      )
    })

    it('requires a verified e-mail', async () => {
      await expectSsoError(
        provisionSsoUser(payload, claims('naoverificado', { email_verified: false }), {
          superAdminRole,
        }),
        'email_not_verified',
      )
    })

    it('requires the e-mail claim', async () => {
      await expectSsoError(
        provisionSsoUser(payload, claims('semEmail', { email: undefined }), { superAdminRole }),
        'invalid_claims',
      )
    })
  })

  describe('session strategy', () => {
    it('authenticates a valid SSO session', async () => {
      const user = await provisionSsoUser(payload, claims('sessao'), { superAdminRole })
      expect((await authenticate(user))?.id).toBe(user.id)
    })

    it('rejects a session revoked by logout (version bumped)', async () => {
      const user = await provisionSsoUser(payload, claims('sessao'), { superAdminRole })
      expect(await authenticate(user, { version: (user.ssoSessionVersion ?? 0) + 1 })).toBeNull()
    })

    it('rejects an SSO session cookie that points to a local account', async () => {
      const local = await payload.create({
        collection: 'users',
        data: { email: email('local2'), password: 'Local-12345!' },
      })
      expect(await authenticate(local)).toBeNull()
    })

    it('rejects the cookie on cross-site requests', async () => {
      const user = await provisionSsoUser(payload, claims('sessao'), { superAdminRole })
      expect(await authenticate(user, { headers: { Origin: 'https://evil.example' } })).toBeNull()
    })

    it('does nothing when SSO is disabled in the environment', async () => {
      const user = await provisionSsoUser(payload, claims('sessao'), { superAdminRole })
      process.env.AUTH_SSO_ENABLED = 'false'
      try {
        expect(await authenticate(user)).toBeNull()
      } finally {
        process.env.AUTH_SSO_ENABLED = 'true'
      }
    })
  })

  describe('one authenticator per account', () => {
    it('an SSO account cannot log in with a password, even a correct one', async () => {
      const user = await provisionSsoUser(payload, claims('senha'), { superAdminRole })
      // Only a trusted server-side call can set a password on an SSO account.
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { password: 'Conhecida-12345!' },
        context: { ssoProvisioning: true },
      })
      await expect(
        payload.login({
          collection: 'users',
          data: { email: email('senha'), password: 'Conhecida-12345!' },
        }),
      ).rejects.toThrow()
    })

    it('a local account logs in with its password', async () => {
      const result = await payload.login({
        collection: 'users',
        data: { email: email('local'), password: 'Local-12345!' },
      })
      expect(result.user?.email).toBe(email('local'))
    })

    it('an SSO account cannot change its e-mail or password in the CMS', async () => {
      const user = await provisionSsoUser(payload, claims('editar'), { superAdminRole })
      const as = { user: { ...user, collection: 'users' as const }, overrideAccess: false }
      await expect(
        payload.update({
          collection: 'users',
          id: user.id,
          data: { email: email('outro') },
          ...as,
        }),
      ).rejects.toThrow()
      await expect(
        payload.update({
          collection: 'users',
          id: user.id,
          data: { password: 'Nova-12345!' },
          ...as,
        }),
      ).rejects.toThrow()
    })

    it('an SSO account cannot reset its password', async () => {
      await provisionSsoUser(payload, claims('reset'), { superAdminRole })
      const token = await payload.forgotPassword({
        collection: 'users',
        data: { email: email('reset') },
        disableEmail: true,
      })
      await expect(
        payload.resetPassword({
          collection: 'users',
          data: { token: String(token), password: 'Nova-12345!' },
          overrideAccess: true,
        }),
      ).rejects.toThrow()
    })

    it('the provider cannot be changed through the API', async () => {
      const local = await payload.find({
        collection: 'users',
        where: { email: { equals: email('local') } },
      })
      const superAdmin = await provisionSsoUser(
        payload,
        claims('admin', { groups: [], roles: [superAdminRole] }),
        {
          superAdminRole,
        },
      )
      const updated = await payload.update({
        collection: 'users',
        id: local.docs[0]!.id,
        data: { authProvider: 'sso', ssoSubject: 'sequestro' },
        user: { ...superAdmin, collection: 'users' },
        overrideAccess: false,
      })
      expect(updated.authProvider).toBe('local')
      expect(updated.ssoSubject ?? null).toBeNull()
    })
  })
})
