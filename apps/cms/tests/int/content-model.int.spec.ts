import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Product, Tenant, User } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Content model (2c): rates business validation on publish, public access to drafts, and roles
 * and tenant isolation on the new collections. Requires Postgres and MinIO running.
 */

let payload: Payload
const run = `${Date.now()}`
const context = { disableRevalidate: true }
const tenants: Record<'a' | 'b', Tenant> = {} as never
const users: Record<'editorA' | 'seoA' | 'editorB', User> = {} as never
let productA: Product

const as = (user: User) => ({
  user: { ...user, collection: 'users' as const },
  overrideAccess: false,
})

const validItems = [
  {
    label: 'Juros',
    kind: 'interest' as const,
    period: 'monthly' as const,
    valueType: 'percent' as const,
    value: 1.99,
  },
  {
    label: 'CET',
    kind: 'cet' as const,
    period: 'monthly' as const,
    valueType: 'percent' as const,
    value: 2.2,
  },
]

const rateData = (extra: Record<string, unknown> = {}) => ({
  title: `Taxas ${run}`,
  product: productA.id,
  tenant: tenants.a.id,
  validFrom: '2026-10-01T00:00:00.000Z',
  items: validItems,
  legalNote: 'Sujeito a análise de crédito.',
  ...extra,
})

describe('content model', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    for (const key of ['a', 'b'] as const) {
      tenants[key] = await payload.create({
        collection: 'tenants',
        data: {
          name: `Modelo ${key}`,
          slug: `modelo-${key}-${run}`,
          siteUrl: `http://${key}.modelo.local`,
          domains: [{ domain: `${key}-${run}.modelo.local` }],
        },
      })
    }

    const user = (key: string, tenant: Tenant, role: 'editor' | 'seo') =>
      payload.create({
        collection: 'users',
        data: {
          email: `${key}-${run}@modelo.local`,
          password: 'Test-12345!',
          tenants: [{ tenant: tenant.id, roles: [role] }],
        },
      })
    users.editorA = await user('editor-a', tenants.a, 'editor')
    users.seoA = await user('seo-a', tenants.a, 'seo')
    users.editorB = await user('editor-b', tenants.b, 'editor')

    productA = await payload.create({
      collection: 'products',
      context,
      data: {
        name: 'Empréstimo',
        slug: `emprestimo-${run}`,
        category: 'loan',
        summary: 'Resumo',
        tenant: tenants.a.id,
      },
    })
  })

  afterAll(async () => {
    const ids = [tenants.a?.id, tenants.b?.id].filter(Boolean)
    for (const collection of [
      'rates',
      'products',
      'banners',
      'faqs',
      'help-topics',
      'help-categories',
      'media',
    ] as const) {
      await payload.delete({ collection, context, where: { tenant: { in: ids } } })
    }
    await payload.delete({
      collection: 'users',
      where: { email: { like: `-${run}@modelo.local` } },
    })
    await payload.delete({ collection: 'tenants', where: { id: { in: ids } } })
  })

  describe('rates: business validation on publish', () => {
    it('saves an incomplete draft', async () => {
      const draft = await payload.create({
        collection: 'rates',
        context,
        draft: true,
        data: rateData({ items: [validItems[0]], legalNote: '', _status: 'draft' }),
        ...as(users.editorA),
      })
      expect(draft._status).toBe('draft')
    })

    it('refuses to publish when a rule is broken (interest without CET)', async () => {
      await expect(
        payload.create({
          collection: 'rates',
          context,
          data: rateData({ items: [validItems[0]], _status: 'published' }),
          ...as(users.editorA),
        }),
      ).rejects.toMatchObject({
        data: {
          errors: [expect.objectContaining({ message: expect.stringMatching(/sem o CET mensal/) })],
        },
      })
    })

    it('refuses to publish without the legal note', async () => {
      await expect(
        payload.create({
          collection: 'rates',
          context,
          data: rateData({ legalNote: '', _status: 'published' }),
          ...as(users.editorA),
        }),
      ).rejects.toMatchObject({
        data: { errors: [expect.objectContaining({ path: 'legalNote' })] },
      })
    })

    it('publishes a consistent table', async () => {
      const rates = await payload.create({
        collection: 'rates',
        context,
        data: rateData({ _status: 'published' }),
        ...as(users.editorA),
      })
      expect(rates._status).toBe('published')
    })

    it('the public never sees draft rate tables', async () => {
      const { docs } = await payload.find({
        collection: 'rates',
        draft: true,
        overrideAccess: false,
        where: { tenant: { equals: tenants.a.id } },
      })
      expect(docs.length).toBeGreaterThan(0)
      expect(docs.every((doc) => doc._status === 'published')).toBe(true)
    })

    it('the SEO role cannot edit rates', async () => {
      await expect(
        payload.create({
          collection: 'rates',
          context,
          data: rateData({ _status: 'published' }),
          ...as(users.seoA),
        }),
      ).rejects.toThrow()
    })
  })

  describe('tenant isolation on the new collections', () => {
    it('an editor cannot change another tenant product', async () => {
      await expect(
        payload.update({
          collection: 'products',
          id: productA.id,
          context,
          data: { name: 'Invadido' },
          ...as(users.editorB),
        }),
      ).rejects.toThrow()
    })

    it('an editor cannot reference another tenant product in a rate table', async () => {
      await expect(
        payload.create({
          collection: 'rates',
          context,
          data: rateData({ tenant: tenants.b.id, _status: 'published' }),
          ...as(users.editorB),
        }),
      ).rejects.toThrow()
    })

    it('help topics: slug unique per tenant, drafts hidden from the public', async () => {
      const category = await payload.create({
        collection: 'help-categories',
        context,
        data: { title: 'Conta', slug: 'conta', tenant: tenants.a.id },
      })
      await payload.create({
        collection: 'help-topics',
        context,
        data: {
          title: 'Rascunho',
          slug: 'rascunho',
          category: category.id,
          tenant: tenants.a.id,
          _status: 'draft',
        },
      })
      const { docs } = await payload.find({
        collection: 'help-topics',
        overrideAccess: false,
        where: { tenant: { equals: tenants.a.id } },
      })
      expect(docs).toHaveLength(0)

      await expect(
        payload.create({
          collection: 'help-categories',
          context,
          data: { title: 'Conta 2', slug: 'conta', tenant: tenants.a.id },
        }),
      ).rejects.toThrow()
    })
  })

  describe('banners', () => {
    it('refuses an end date before the start date', async () => {
      const data = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64',
      )
      const image = await payload.create({
        collection: 'media',
        data: { alt: 'x', tenant: tenants.a.id },
        file: { data, mimetype: 'image/png', name: `banner-${run}.png`, size: data.byteLength },
      })
      await expect(
        payload.create({
          collection: 'banners',
          context,
          data: {
            title: 'Banner',
            alt: 'Banner',
            image: image.id,
            tenant: tenants.a.id,
            startsAt: '2026-12-01T00:00:00.000Z',
            endsAt: '2026-11-01T00:00:00.000Z',
          },
        }),
      ).rejects.toThrow()
    })
  })
})
