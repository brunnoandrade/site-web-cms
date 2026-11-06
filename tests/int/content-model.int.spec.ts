import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Tenant } from '@/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Content model (2c): public access to drafts and slug uniqueness per tenant on the help center
 * collections. Requires Postgres and MinIO running.
 */

let payload: Payload
const run = `${Date.now()}`
const context = { disableRevalidate: true }
let tenant: Tenant

describe('content model', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Modelo',
        slug: `modelo-${run}`,
        siteUrl: 'http://modelo.local',
        domains: [{ domain: `${run}.modelo.local` }],
      },
    })
  })

  afterAll(async () => {
    for (const collection of ['faqs', 'help-topics', 'help-categories', 'media'] as const) {
      await payload.delete({ collection, context, where: { tenant: { equals: tenant.id } } })
    }
    await payload.delete({ collection: 'tenants', where: { id: { equals: tenant.id } } })
  })

  it('help topics: slug unique per tenant, drafts hidden from the public', async () => {
    const category = await payload.create({
      collection: 'help-categories',
      context,
      data: { title: 'Conta', slug: 'conta', tenant: tenant.id },
    })
    await payload.create({
      collection: 'help-topics',
      context,
      data: {
        title: 'Rascunho',
        slug: 'rascunho',
        category: category.id,
        tenant: tenant.id,
        _status: 'draft',
      },
    })
    const { docs } = await payload.find({
      collection: 'help-topics',
      overrideAccess: false,
      where: { tenant: { equals: tenant.id } },
    })
    expect(docs).toHaveLength(0)

    await expect(
      payload.create({
        collection: 'help-categories',
        context,
        data: { title: 'Conta 2', slug: 'conta', tenant: tenant.id },
      }),
    ).rejects.toThrow()
  })
})
