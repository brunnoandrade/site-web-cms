import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Tenant } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { migrateWordPress, type WpPost } from '@/wordpress/migrate'

/**
 * WordPress migration against a fake WordPress (no network): content conversion, idempotency,
 * updates and URL changes. Requires Postgres and MinIO running.
 */

let payload: Payload
const run = `${Date.now()}`
let tenant: Tenant
const SOURCE = 'https://wp.test/blog'
const categorySlug = `cat-${run}`

// 1x1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

const post = (overrides: Partial<WpPost> = {}): WpPost => ({
  id: 9000 + Number(run.slice(-4)),
  slug: `post-${run}`,
  link: `https://wp.test/blog/${categorySlug}/post-${run}/`,
  date_gmt: '2024-05-10T12:00:00',
  modified_gmt: '2024-05-10T12:00:00',
  title: { rendered: 'Caf&#233; &amp; cr&eacute;dito' },
  content: {
    rendered: [
      '<h2>Título</h2>',
      '<p><span class="TextRun">Texto com <a href="https://wp.test/blog/outra/post/">link interno</a>.</span></p>',
      '<ul><li>um</li></ul><ul><li>dois</li></ul>',
      '<table><tbody><tr><td>Taxa</td><td>1,99%</td></tr></tbody></table>',
      '<p><a href="https://wp.test/blog/wp-content/uploads/foto.png"><img src="https://wp.test/blog/wp-content/uploads/foto.png"></a></p>',
      '<iframe title="Vídeo" src="https://www.youtube.com/embed/abc123XYZ"></iframe>',
    ].join(''),
  },
  _embedded: {
    author: [{ id: 98, slug: 'usuario-de-servico-adm-via-cofre', name: 'Usuário de serviço' }],
    'wp:term': [
      [
        {
          id: 7000 + Number(run.slice(-3)),
          taxonomy: 'category',
          slug: categorySlug,
          name: 'Categoria &amp; Teste',
        },
      ],
    ],
  },
  ...overrides,
})

/** Fake WordPress: REST API, published pages (SEO head) and images. */
const fakeWordPress = (posts: WpPost[]) => {
  const requests: string[] = []
  const fetcher = (async (input: string | URL | Request) => {
    const url = String(input)
    requests.push(url)
    if (url.includes('/wp-json/wp/v2/posts')) {
      return new Response(JSON.stringify(posts), {
        headers: { 'x-wp-totalpages': '1', 'content-type': 'application/json' },
      })
    }
    if (url.endsWith('.png')) return new Response(PNG, { headers: { 'content-type': 'image/png' } })
    return new Response(
      `<html><head><title>Título SEO | Blog do Digio</title><meta name="description" content="Descrição SEO"></head></html>`,
      { headers: { 'content-type': 'text/html' } },
    )
  }) as typeof fetch
  return { fetcher, requests }
}

const migrate = (posts: WpPost[], extra: Record<string, unknown> = {}) => {
  const { fetcher, requests } = fakeWordPress(posts)
  return migrateWordPress(payload, {
    source: SOURCE,
    tenant: tenant.slug,
    fetch: fetcher,
    ...extra,
  }).then((report) => ({ report, requests }))
}

const findPost = async () =>
  (
    await payload.find({
      collection: 'posts',
      depth: 1,
      where: { and: [{ tenant: { equals: tenant.id } }, { wpId: { equals: post().id } }] },
    })
  ).docs[0]!

describe('WordPress migration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'WP',
        slug: `wp-${run}`,
        siteUrl: 'https://wp.test',
        domains: [{ domain: `wp-${run}.local` }],
      },
    })
  })

  afterAll(async () => {
    const context = { disableRevalidate: true }
    for (const collection of ['redirects', 'posts', 'categories', 'authors', 'media'] as const) {
      await payload.delete({ collection, context, where: { tenant: { equals: tenant.id } } })
    }
    await payload.delete({ collection: 'tenants', id: tenant.id })
  })

  it('migrates a post with the same URL, SEO, author override and full content', async () => {
    const { report } = await migrate([post()])
    expect(report.errors).toEqual([])
    expect(report.contentLoss).toEqual([])
    expect(report.posts.created).toBe(1)
    expect(report.urlChanges).toEqual([])

    const doc = await findPost()
    expect(doc.title).toBe('Café & crédito')
    expect(doc.meta).toMatchObject({ title: 'Título SEO', description: 'Descrição SEO' })
    expect(doc.publishedAt).toBe('2024-05-10T12:00:00.000Z')
    expect(doc._status).toBe('published')
    expect(typeof doc.category === 'object' && doc.category).toMatchObject({
      slug: categorySlug,
      title: 'Categoria & Teste',
    })
    expect(doc.authors?.map((a) => (typeof a === 'object' ? a.name : a))).toEqual(['Digio'])

    const content = JSON.stringify(doc.content)
    for (const type of ['heading', 'list', 'table', 'upload', 'link'])
      expect(content).toContain(`"type":"${type}"`)
    expect(content).toContain('"url":"/blog/outra/post/"')
    expect(content).toContain('youtube.com/watch?v=abc123XYZ')
  })

  it('does nothing on a second run (no new versions, no downloads)', async () => {
    const { report, requests } = await migrate([post()])
    expect(report.posts).toMatchObject({ created: 0, updated: 0, unchanged: 1 })
    expect(requests.filter((url) => url.endsWith('.png'))).toEqual([])
  })

  it('updates a post modified in WordPress, reusing its images', async () => {
    const { report, requests } = await migrate([
      post({ modified_gmt: '2024-06-01T10:00:00', title: { rendered: 'Novo título' } }),
    ])
    expect(report.posts.updated).toBe(1)
    expect(report.media).toMatchObject({ imported: 0, reused: 1 })
    expect(requests.filter((url) => url.endsWith('.png'))).toEqual([])
    expect((await findPost()).title).toBe('Novo título')
  })

  it('a slug changed in WordPress keeps the old URL working (redirect)', async () => {
    const newSlug = `post-${run}-novo`
    await migrate([
      post({
        slug: newSlug,
        link: `https://wp.test/blog/${categorySlug}/${newSlug}/`,
        modified_gmt: '2024-07-01T10:00:00',
      }),
    ])
    const { docs } = await payload.find({
      collection: 'redirects',
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { from: { equals: `/blog/${categorySlug}/post-${run}/` } },
        ],
      },
    })
    expect(docs[0]?.destinationPath).toBe(`/blog/${categorySlug}/${newSlug}/`)
  })

  it('a dry run writes nothing', async () => {
    const other = post({
      id: post().id + 1,
      slug: `outro-${run}`,
      link: `https://wp.test/blog/${categorySlug}/outro-${run}/`,
    })
    const { report } = await migrate([other], { dryRun: true })
    expect(report.posts.created).toBe(1)
    const { totalDocs } = await payload.count({
      collection: 'posts',
      where: { wpId: { equals: other.id } },
    })
    expect(totalDocs).toBe(0)
  })
})
