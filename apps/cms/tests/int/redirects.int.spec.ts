import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Page, Redirect, Tenant, User } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Redirect rules (CLAUDE.md, "Redirects e rastreio") and automatic redirects on URL changes.
 * Requires Postgres and MinIO running.
 */

let payload: Payload
const run = `${Date.now()}`
const context = { disableRevalidate: true }
let tenant: Tenant
let editor: User
let seo: User

const layout = [{ blockType: 'content' as const, columns: [] }]
const as = (user: User) => ({
  user: { ...user, collection: 'users' as const },
  overrideAccess: false,
})

const slug = (name: string) => `${name}-${run}`
const path = (name: string) => `/${slug(name)}/`

const createRedirect = (data: Partial<Redirect>) =>
  payload.create({
    collection: 'redirects',
    context,
    data: { tenant: tenant.id, ...data } as never,
  })

const custom = (url: string) => ({ type: 'custom' as const, url })

const redirectsFrom = async (from: string) =>
  (
    await payload.find({
      collection: 'redirects',
      depth: 0,
      where: { and: [{ tenant: { equals: tenant.id } }, { from: { equals: from } }] },
    })
  ).docs

const publishPage = (name: string) =>
  payload.create({
    collection: 'pages',
    context,
    data: {
      title: name,
      slug: slug(name),
      tenant: tenant.id,
      _status: 'published',
      hero: { type: 'none' },
      layout,
    },
  })

const rename = (
  page: Page,
  name: string,
  status: 'published' | 'draft' = 'published',
  user?: User,
) =>
  payload.update({
    collection: 'pages',
    id: page.id,
    context,
    draft: status === 'draft',
    data: { slug: slug(name), _status: status },
    ...(user ? as(user) : {}),
  })

describe('redirects', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Redirects',
        slug: `redir-${run}`,
        siteUrl: 'https://www.redir.test.local',
        domains: [{ domain: `www.redir-${run}.local` }],
      },
    })
    const user = (key: string, role: 'editor' | 'seo') =>
      payload.create({
        collection: 'users',
        data: {
          email: `${key}-${run}@redir.local`,
          password: 'Test-12345!',
          tenants: [{ tenant: tenant.id, roles: [role] }],
        },
      })
    editor = await user('editor', 'editor')
    seo = await user('seo', 'seo')
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'redirects',
      context,
      where: { tenant: { equals: tenant.id } },
    })
    await payload.delete({ collection: 'pages', context, where: { tenant: { equals: tenant.id } } })
    await payload.delete({ collection: 'users', where: { email: { like: `-${run}@redir.local` } } })
    await payload.delete({ collection: 'tenants', id: tenant.id })
  })

  describe('rules', () => {
    it('normalizes the source (full URL, no trailing slash, query string)', async () => {
      const redirect = await createRedirect({
        from: `https://www.digio.com.br/${slug('fonte')}?utm_source=x`,
        to: custom('/destino/'),
      })
      expect(redirect.from).toBe(path('fonte'))
      expect(redirect.destinationPath).toBe('/destino/')
      expect(redirect.type).toBe('301')
    })

    it('refuses a duplicated source, even written differently', async () => {
      await expect(
        createRedirect({ from: `/${slug('fonte')}`, to: custom('/outro/') }),
      ).rejects.toMatchObject({
        data: { errors: [expect.objectContaining({ path: 'from' })] },
      })
    })

    it('refuses a loop', async () => {
      await expect(
        createRedirect({ from: path('loop'), to: custom(path('loop')) }),
      ).rejects.toThrow()
    })

    it.each(['javascript:alert(1)', 'data:text/html,x', '//evil.com', '/\\evil.com'])(
      'refuses an unsafe destination (%s)',
      async (url) => {
        await expect(
          createRedirect({ from: path(`unsafe-${url.length}`), to: custom(url) }),
        ).rejects.toThrow()
      },
    )

    it('accepts an external https destination', async () => {
      const doc = await createRedirect({
        from: path('externo'),
        to: custom('https://parceiro.example.com/oferta/'),
      })
      expect(doc.id).toBeTruthy()
    })

    it('refuses a chain through the destination (A -> B -> C)', async () => {
      await createRedirect({ from: path('b'), to: custom('/c/') })
      await expect(
        createRedirect({ from: path('a'), to: custom(path('b')) }),
      ).rejects.toMatchObject({
        data: { errors: [expect.objectContaining({ message: expect.stringMatching(/cadeia/) })] },
      })
    })

    it('refuses a chain through the source (X -> A while A -> B exists)', async () => {
      await createRedirect({ from: path('x'), to: custom(path('y')) })
      await expect(createRedirect({ from: path('y'), to: custom('/z/') })).rejects.toMatchObject({
        data: { errors: [expect.objectContaining({ message: expect.stringMatching(/cadeia/) })] },
      })
    })

    it('treats absolute URLs on the tenant domain as internal (chain check applies)', async () => {
      await expect(
        createRedirect({
          from: path('abs'),
          to: custom(`https://www.redir-${run}.local${path('b')}`),
        }),
      ).rejects.toThrow()
    })

    it('accepts external destinations', async () => {
      const redirect = await createRedirect({
        from: path('app'),
        to: custom('https://apps.apple.com/br/app/digio'),
      })
      expect(redirect.destinationPath ?? null).toBeNull()
    })

    it('refuses an active redirect that would hide a published page; allows it inactive', async () => {
      await publishPage('viva')
      await expect(
        createRedirect({ from: path('viva'), to: custom('/outra/') }),
      ).rejects.toMatchObject({
        data: {
          errors: [expect.objectContaining({ message: expect.stringMatching(/esconderia/) })],
        },
      })
      const inactive = await createRedirect({
        from: path('viva'),
        to: custom('/outra/'),
        active: false,
      })
      expect(inactive.active).toBe(false)
    })

    it('resolves references to the document URL', async () => {
      const page = await publishPage('alvo')
      const redirect = await createRedirect({
        from: path('para-alvo'),
        to: { type: 'reference', reference: { relationTo: 'pages', value: page.id } },
      })
      expect(redirect.destinationPath).toBe(path('alvo'))
    })

    it('only admin and SEO edit redirects', async () => {
      await expect(
        payload.create({
          collection: 'redirects',
          context,
          data: { tenant: tenant.id, from: path('editor'), to: custom('/x/') },
          ...as(editor),
        }),
      ).rejects.toThrow()
      const bySeo = await payload.create({
        collection: 'redirects',
        context,
        data: { tenant: tenant.id, from: path('seo'), to: custom('/x/') },
        ...as(seo),
      })
      expect(bySeo.id).toBeDefined()
    })
  })

  describe('automatic redirect when a published URL changes', () => {
    let page: Page

    it('creates old URL -> page when the slug changes on publish', async () => {
      page = await publishPage('v1')
      await rename(page, 'v2')
      const [redirect] = await redirectsFrom(path('v1'))
      expect(redirect?.origin).toBe('auto')
      expect(redirect?.destinationPath).toBe(path('v2'))
      expect(redirect?.to?.type).toBe('reference')
    })

    it('does nothing while the new slug is only a draft (autosave)', async () => {
      await rename(page, 'rascunho', 'draft')
      expect(await redirectsFrom(path('v2'))).toHaveLength(0)
    })

    it('keeps the graph flat on the next rename (no chain v1 -> v2 -> v3)', async () => {
      await rename(page, 'v3')
      const [fromV1] = await redirectsFrom(path('v1'))
      const [fromV2] = await redirectsFrom(path('v2'))
      expect(fromV1?.destinationPath).toBe(path('v3'))
      expect(fromV2?.destinationPath).toBe(path('v3'))
    })

    it('renaming back removes the redirect that would hide the page', async () => {
      await rename(page, 'v1')
      expect(await redirectsFrom(path('v1'))).toHaveLength(0)
      const [fromV2] = await redirectsFrom(path('v2'))
      const [fromV3] = await redirectsFrom(path('v3'))
      expect(fromV2?.destinationPath).toBe(path('v1'))
      expect(fromV3?.destinationPath).toBe(path('v1'))
    })

    it('is created even when the editor cannot edit redirects', async () => {
      const other = await publishPage('do-editor')
      await rename(other, 'do-editor-novo', 'published', editor)
      const [redirect] = await redirectsFrom(path('do-editor'))
      expect(redirect?.destinationPath).toBe(path('do-editor-novo'))
    })

    it('flattens manual redirects that pointed to the old URL', async () => {
      const target = await publishPage('manual-alvo')
      await createRedirect({ from: path('manual-origem'), to: custom(path('manual-alvo')) })
      await rename(target, 'manual-alvo-novo')
      const [manual] = await redirectsFrom(path('manual-origem'))
      expect(manual?.destinationPath).toBe(path('manual-alvo-novo'))
    })
  })
})
