import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { canAccessAdmin } from '@/access/roles'
import type { Page, Tenant, User } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Multi-tenant isolation and per-tenant roles (RBAC), through the Local API with access
 * control enforced (`overrideAccess: false`), as the admin panel and REST API do.
 * Requires Postgres and MinIO running (docker compose up -d).
 */

let payload: Payload

// Skips the website revalidation webhook in these tests.
const context = { disableRevalidate: true }
const run = `${Date.now()}`

const tenants: Record<'a' | 'b', Tenant> = {} as never
const users: Record<'editorA' | 'seoA' | 'adminA' | 'multi' | 'superAdmin' | 'preview', User> =
  {} as never
const pages: Record<'draftA' | 'publishedA' | 'publishedB', Page> = {} as never

// Pages require at least one layout block.
const layout = [{ blockType: 'content' as const, columns: [] }]

const as = (user: User) => ({
  user: { ...user, collection: 'users' as const },
  overrideAccess: false,
})

const createUser = (key: string, data: Partial<User>) =>
  payload.create({
    collection: 'users',
    data: { email: `${key}-${run}@test.local`, password: 'Test-12345!', name: key, ...data },
  })

const createPage = (tenant: Tenant, slug: string, status: 'draft' | 'published') =>
  payload.create({
    collection: 'pages',
    context,
    data: { title: slug, slug, tenant: tenant.id, _status: status, hero: { type: 'none' }, layout },
  })

describe('multi-tenant isolation', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    tenants.a = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Teste A',
        slug: `test-a-${run}`,
        siteUrl: 'http://a.test.local',
        domains: [{ domain: `a-${run}.test.local` }],
      },
    })
    tenants.b = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Teste B',
        slug: `test-b-${run}`,
        siteUrl: 'http://b.test.local',
        domains: [{ domain: `b-${run}.test.local` }],
      },
    })

    users.editorA = await createUser('editor-a', {
      tenants: [{ tenant: tenants.a.id, roles: ['editor'] }],
    })
    users.seoA = await createUser('seo-a', { tenants: [{ tenant: tenants.a.id, roles: ['seo'] }] })
    users.adminA = await createUser('admin-a', {
      tenants: [{ tenant: tenants.a.id, roles: ['admin'] }],
    })
    users.multi = await createUser('multi', {
      tenants: [
        { tenant: tenants.a.id, roles: ['editor'] },
        { tenant: tenants.b.id, roles: ['editor'] },
      ],
    })
    users.superAdmin = await createUser('super', { roles: ['super-admin'] })
    users.preview = await createUser('preview', { roles: ['preview'] })

    pages.draftA = await createPage(tenants.a, 'rascunho', 'draft')
    pages.publishedA = await createPage(tenants.a, 'publicada', 'published')
    pages.publishedB = await createPage(tenants.b, 'publicada', 'published')
  })

  afterAll(async () => {
    const tenantIDs = [tenants.a?.id, tenants.b?.id].filter(Boolean)
    for (const collection of ['pages', 'redirects', 'media'] as const) {
      await payload.delete({ collection, context, where: { tenant: { in: tenantIDs } } })
    }
    await payload.delete({ collection: 'users', where: { email: { like: `-${run}@test.local` } } })
    await payload.delete({ collection: 'tenants', where: { id: { in: tenantIDs } } })
  })

  describe('content', () => {
    it('anonymous visitors only read published pages', async () => {
      const { docs } = await payload.find({
        collection: 'pages',
        draft: true,
        overrideAccess: false,
        where: { tenant: { in: [tenants.a.id, tenants.b.id] } },
      })
      expect(docs.map((doc) => doc.id).sort()).toEqual(
        [pages.publishedA.id, pages.publishedB.id].sort(),
      )
    })

    it('an editor only reads pages of their own tenant, drafts included', async () => {
      const { docs } = await payload.find({
        collection: 'pages',
        draft: true,
        ...as(users.editorA),
      })
      const tenantIDs = new Set(
        docs.map((doc) => (typeof doc.tenant === 'object' ? doc.tenant?.id : doc.tenant)),
      )
      expect([...tenantIDs]).toEqual([tenants.a.id])
      expect(docs.map((doc) => doc.id)).toContain(pages.draftA.id)
    })

    it('an editor lists the versions of their own tenant only (no 500 on the versions table)', async () => {
      const { docs } = await payload.findVersions({
        collection: 'pages',
        depth: 0,
        limit: 100,
        ...as(users.editorA),
      })
      const tenantIDs = new Set(
        docs.map((doc) =>
          typeof doc.version.tenant === 'object' ? doc.version.tenant?.id : doc.version.tenant,
        ),
      )
      expect(docs.length).toBeGreaterThan(0)
      expect([...tenantIDs]).toEqual([tenants.a.id])
    })

    it('an editor cannot create a page in another tenant', async () => {
      await expect(
        payload.create({
          collection: 'pages',
          context,
          data: {
            title: 'x',
            slug: `x-${run}`,
            tenant: tenants.b.id,
            hero: { type: 'none' },
            layout,
          },
          ...as(users.editorA),
        }),
      ).rejects.toThrow()
    })

    it('an editor creates pages in their own tenant', async () => {
      const page = await payload.create({
        collection: 'pages',
        context,
        data: {
          title: 'nova',
          slug: `nova-${run}`,
          tenant: tenants.a.id,
          hero: { type: 'none' },
          layout,
        },
        ...as(users.editorA),
      })
      expect(page.id).toBeDefined()
    })

    it('an editor cannot update a page of another tenant', async () => {
      await expect(
        payload.update({
          collection: 'pages',
          id: pages.publishedB.id,
          context,
          data: { title: 'invadida' },
          ...as(users.editorA),
        }),
      ).rejects.toThrow()
    })

    it('a user with roles in two tenants reads both', async () => {
      const { docs } = await payload.find({ collection: 'pages', ...as(users.multi) })
      const ids = docs.map((doc) => doc.id)
      expect(ids).toContain(pages.publishedA.id)
      expect(ids).toContain(pages.publishedB.id)
    })

    it('the same slug can exist in two tenants, but not twice in one', async () => {
      expect(pages.publishedB.slug).toBe(pages.publishedA.slug)
      await expect(createPage(tenants.a, 'publicada', 'published')).rejects.toThrow()
    })
  })

  describe('SEO role', () => {
    it('cannot create pages', async () => {
      await expect(
        payload.create({
          collection: 'pages',
          context,
          data: {
            title: 'x',
            slug: `seo-${run}`,
            tenant: tenants.a.id,
            hero: { type: 'none' },
            layout,
          },
          ...as(users.seoA),
        }),
      ).rejects.toThrow()
    })

    it('updates pages of their tenant (SEO fields)', async () => {
      const page = await payload.update({
        collection: 'pages',
        id: pages.publishedA.id,
        context,
        data: { meta: { title: 'Título SEO' } },
        ...as(users.seoA),
      })
      expect(page.meta?.title).toBe('Título SEO')
    })

    it('manages redirects; editors cannot', async () => {
      const redirect = await payload.create({
        collection: 'redirects',
        context,
        data: {
          from: `/antiga-${run}/`,
          to: { type: 'custom', url: '/nova/' },
          tenant: tenants.a.id,
        },
        ...as(users.seoA),
      })
      expect(redirect.id).toBeDefined()

      await expect(
        payload.create({
          collection: 'redirects',
          context,
          data: {
            from: `/outra-${run}/`,
            to: { type: 'custom', url: '/nova/' },
            tenant: tenants.a.id,
          },
          ...as(users.editorA),
        }),
      ).rejects.toThrow()
    })
  })

  describe('users and privilege escalation', () => {
    it('a user cannot make themselves super-admin', async () => {
      const updated = await payload.update({
        collection: 'users',
        id: users.editorA.id,
        data: { roles: ['super-admin'] },
        ...as(users.editorA),
      })
      expect(updated.roles ?? []).not.toContain('super-admin')
    })

    // Writes to the tenants array by non-admins are discarded (field access), so these check
    // what was actually saved.
    const savedTenantRows = async (id: number) =>
      (await payload.findByID({ collection: 'users', id, depth: 0 })).tenants?.map((row) => ({
        tenant: row.tenant,
        roles: row.roles,
      }))

    it('a user cannot add themselves to another tenant', async () => {
      await payload
        .update({
          collection: 'users',
          id: users.editorA.id,
          data: {
            tenants: [
              { tenant: tenants.a.id, roles: ['editor'] },
              { tenant: tenants.b.id, roles: ['admin'] },
            ],
          },
          ...as(users.editorA),
        })
        .catch(() => undefined)
      expect(await savedTenantRows(users.editorA.id)).toEqual([
        { tenant: tenants.a.id, roles: ['editor'] },
      ])
    })

    it('a user cannot promote themselves inside their tenant', async () => {
      await payload
        .update({
          collection: 'users',
          id: users.editorA.id,
          data: { tenants: [{ tenant: tenants.a.id, roles: ['admin'] }] },
          ...as(users.editorA),
        })
        .catch(() => undefined)
      expect(await savedTenantRows(users.editorA.id)).toEqual([
        { tenant: tenants.a.id, roles: ['editor'] },
      ])
    })

    it('a tenant admin changes roles inside their tenant', async () => {
      await payload.update({
        collection: 'users',
        id: users.seoA.id,
        data: { tenants: [{ tenant: tenants.a.id, roles: ['seo', 'editor'] }] },
        ...as(users.adminA),
      })
      expect(await savedTenantRows(users.seoA.id)).toEqual([
        { tenant: tenants.a.id, roles: ['seo', 'editor'] },
      ])
    })

    it('a tenant admin cannot grant access to a tenant they do not administer', async () => {
      await expect(
        payload.update({
          collection: 'users',
          id: users.seoA.id,
          data: {
            tenants: [
              { tenant: tenants.a.id, roles: ['seo', 'editor'] },
              { tenant: tenants.b.id, roles: ['editor'] },
            ],
          },
          ...as(users.adminA),
        }),
      ).rejects.toThrow()
      expect(await savedTenantRows(users.seoA.id)).toEqual([
        { tenant: tenants.a.id, roles: ['seo', 'editor'] },
      ])
    })

    it('a tenant admin cannot create users in another tenant', async () => {
      await expect(
        payload.create({
          collection: 'users',
          data: {
            email: `intruso-${run}@test.local`,
            password: 'Test-12345!',
            tenants: [{ tenant: tenants.b.id, roles: ['admin'] }],
          },
          ...as(users.adminA),
        }),
      ).rejects.toThrow()
    })

    it('a tenant admin manages users of their tenant only', async () => {
      const updated = await payload.update({
        collection: 'users',
        id: users.editorA.id,
        data: { name: 'Editor A (renomeado)' },
        ...as(users.adminA),
      })
      expect(updated.name).toBe('Editor A (renomeado)')
    })

    it('a tenant admin cannot change an account that also has access to another tenant', async () => {
      await expect(
        payload.update({
          collection: 'users',
          id: users.multi.id,
          data: { password: 'Tomada-12345!' },
          ...as(users.adminA),
        }),
      ).rejects.toThrow()
    })

    it('a tenant admin cannot see super-admins', async () => {
      const { docs } = await payload.find({ collection: 'users', limit: 100, ...as(users.adminA) })
      const ids = docs.map((doc) => doc.id)
      expect(ids).toContain(users.editorA.id)
      expect(ids).not.toContain(users.superAdmin.id)
    })

    it('an editor only sees their own account', async () => {
      const { docs } = await payload.find({ collection: 'users', limit: 100, ...as(users.editorA) })
      expect(docs.map((doc) => doc.id)).toEqual([users.editorA.id])
    })
  })

  describe('preview service account', () => {
    it('reads drafts of every tenant', async () => {
      const { docs } = await payload.find({
        collection: 'pages',
        draft: true,
        where: { tenant: { in: [tenants.a.id, tenants.b.id] } },
        ...as(users.preview),
      })
      expect(docs.map((doc) => doc.id)).toContain(pages.draftA.id)
      expect(docs.map((doc) => doc.id)).toContain(pages.publishedB.id)
    })

    it('cannot change content', async () => {
      await expect(
        payload.update({
          collection: 'pages',
          id: pages.publishedB.id,
          context,
          data: { title: 'alterada' },
          ...as(users.preview),
        }),
      ).rejects.toThrow()
    })

    it('cannot use the admin panel', () => {
      expect(canAccessAdmin({ req: { user: users.preview } } as never)).toBe(false)
    })

    it('cannot add itself to a tenant', async () => {
      await payload
        .update({
          collection: 'users',
          id: users.preview.id,
          data: { tenants: [{ tenant: tenants.a.id, roles: ['admin'] }] },
          ...as(users.preview),
        })
        .catch(() => undefined)
      const saved = await payload.findByID({ collection: 'users', id: users.preview.id, depth: 0 })
      expect(saved.tenants ?? []).toEqual([])
    })
  })

  describe('tenants', () => {
    it('a domain cannot belong to two tenants', async () => {
      await expect(
        payload.create({
          collection: 'tenants',
          data: {
            name: 'Duplicado',
            slug: `dup-${run}`,
            siteUrl: 'http://dup.test.local',
            domains: [{ domain: `A-${run}.test.local:3000` }],
          },
        }),
      ).rejects.toMatchObject({
        data: {
          errors: [expect.objectContaining({ message: expect.stringMatching(/já pertence/) })],
        },
      })
    })

    it('only super-admins create tenants', async () => {
      await expect(
        payload.create({
          collection: 'tenants',
          data: {
            name: 'X',
            slug: `x-${run}`,
            siteUrl: 'http://x.test.local',
            domains: [{ domain: `x-${run}.local` }],
          },
          ...as(users.adminA),
        }),
      ).rejects.toThrow()
    })

    it('stores media under the tenant folder', async () => {
      // 1x1 transparent PNG
      const data = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64',
      )
      const media = await payload.create({
        collection: 'media',
        data: { alt: 'teste', tenant: tenants.a.id },
        file: { data, mimetype: 'image/png', name: `pixel-${run}.png`, size: data.byteLength },
        ...as(users.editorA),
      })
      expect(media.prefix).toBe(`tenants/${tenants.a.slug}`)
      expect(media.url).toContain(`/tenants/${tenants.a.slug}/`)
    })
  })
})
