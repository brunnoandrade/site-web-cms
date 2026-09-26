import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Tenant, User } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * API keys: only service accounts (role `preview`) have one, and only super-admins manage them.
 * Requires Postgres and MinIO running.
 */

let payload: Payload
const run = `${Date.now()}`
const email = (key: string) => `${key}-${run}@apikey.local`
let tenant: Tenant
let superAdmin: User
let tenantAdmin: User
let editor: User
let service: User

const as = (user: User) => ({
  user: { ...user, collection: 'users' as const },
  overrideAccess: false,
})

const createUser = (key: string, data: Partial<User> = {}) =>
  payload.create({
    collection: 'users',
    data: { email: email(key), password: 'Test-12345!', ...data } as never,
  })

const authWithKey = async (key: string) =>
  (await payload.auth({ headers: new Headers({ Authorization: `users API-Key ${key}` }) })).user

const setKey = (id: number, apiKey: string, actor: User) =>
  payload.update({
    collection: 'users',
    id,
    data: { enableAPIKey: true, apiKey } as never,
    ...as(actor),
  })

describe('API keys', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'API key',
        slug: `apikey-${run}`,
        siteUrl: 'http://apikey.local',
        domains: [{ domain: `apikey-${run}.local` }],
      },
    })
    superAdmin = await createUser('super', { roles: ['super-admin'] })
    tenantAdmin = await createUser('admin', { tenants: [{ tenant: tenant.id, roles: ['admin'] }] })
    editor = await createUser('editor', { tenants: [{ tenant: tenant.id, roles: ['editor'] }] })
    service = await createUser('service', { roles: ['preview'] })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'users',
      where: { email: { like: `-${run}@apikey.local` } },
    })
    await payload.delete({ collection: 'tenants', id: tenant.id })
  })

  it('a user cannot create an API key for their own account', async () => {
    const key = `self-${run}`
    await setKey(editor.id, key, editor)
    expect(await authWithKey(key)).toBeNull()
  })

  it('a tenant admin cannot create API keys', async () => {
    const key = `tenant-admin-${run}`
    await setKey(editor.id, key, tenantAdmin)
    expect(await authWithKey(key)).toBeNull()
  })

  it('not even a super-admin can give an API key to a regular account', async () => {
    const key = `regular-${run}`
    await setKey(editor.id, key, superAdmin)
    expect(await authWithKey(key)).toBeNull()
  })

  it('a super-admin gives an API key to a service account', async () => {
    const key = `service-${run}`
    await setKey(service.id, key, superAdmin)
    expect((await authWithKey(key))?.id).toBe(service.id)
  })

  it('removing the service role revokes the API key', async () => {
    const key = `service-${run}`
    await payload.update({
      collection: 'users',
      id: service.id,
      data: { roles: [] },
      ...as(superAdmin),
    })
    expect(await authWithKey(key)).toBeNull()
    const doc = await payload.findByID({ collection: 'users', id: service.id })
    expect(doc.enableAPIKey).toBeFalsy()
  })
})
