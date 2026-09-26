import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Category, Post, Tenant } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Blog URLs (/blog/<categoria>/<slug>/): changing a post category or a category slug keeps
 * every old URL working through automatic redirects.
 */

let payload: Payload
const run = `${Date.now()}`
const context = { disableRevalidate: true }
let tenant: Tenant
const categories: Record<'a' | 'b', Category> = {} as never
let post: Post

const redirectFrom = async (from: string) =>
  (
    await payload.find({
      collection: 'redirects',
      where: { and: [{ tenant: { equals: tenant.id } }, { from: { equals: from } }] },
    })
  ).docs[0]

describe('blog URLs', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Blog',
        slug: `blog-${run}`,
        siteUrl: 'http://blog.local',
        domains: [{ domain: `blog-${run}.local` }],
      },
    })
    for (const key of ['a', 'b'] as const) {
      categories[key] = await payload.create({
        collection: 'categories',
        context,
        data: { title: key, slug: `cat-${key}-${run}`, tenant: tenant.id },
      })
    }
    post = await payload.create({
      collection: 'posts',
      context,
      data: {
        title: 'Post',
        slug: `post-${run}`,
        category: categories.a.id,
        tenant: tenant.id,
        _status: 'published',
        content: {
          root: {
            type: 'root',
            direction: null,
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    text: 'Texto',
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                  },
                ],
              },
            ],
          },
        } as never,
      },
    })
  })

  afterAll(async () => {
    for (const collection of ['redirects', 'posts', 'categories'] as const) {
      await payload.delete({ collection, context, where: { tenant: { equals: tenant.id } } })
    }
    await payload.delete({ collection: 'tenants', id: tenant.id })
  })

  it('moving a post to another category redirects its old URL', async () => {
    await payload.update({
      collection: 'posts',
      id: post.id,
      context,
      data: { category: categories.b.id, _status: 'published' },
    })
    const redirect = await redirectFrom(`/blog/cat-a-${run}/post-${run}/`)
    expect(redirect?.destinationPath).toBe(`/blog/cat-b-${run}/post-${run}/`)
    expect(redirect?.origin).toBe('auto')
  })

  it('renaming a category redirects its posts and its page, without chains', async () => {
    await payload.update({
      collection: 'categories',
      id: categories.b.id,
      context,
      data: { slug: `cat-b2-${run}` },
    })

    const fromPost = await redirectFrom(`/blog/cat-b-${run}/post-${run}/`)
    expect(fromPost?.destinationPath).toBe(`/blog/cat-b2-${run}/post-${run}/`)

    // The earlier redirect now points straight to the final URL.
    const fromFirst = await redirectFrom(`/blog/cat-a-${run}/post-${run}/`)
    expect(fromFirst?.destinationPath).toBe(`/blog/cat-b2-${run}/post-${run}/`)

    const fromCategory = await redirectFrom(`/blog/cat-b-${run}/`)
    expect(fromCategory?.destinationPath).toBe(`/blog/cat-b2-${run}/`)
  })

  it('a redirect cannot hide a published post or a category page', async () => {
    const create = (from: string) =>
      payload.create({
        collection: 'redirects',
        context,
        data: { tenant: tenant.id, from, to: { type: 'custom', url: '/outro/' } },
      })
    const hides = {
      data: {
        errors: expect.arrayContaining([
          expect.objectContaining({ message: expect.stringMatching(/esconderia/) }),
        ]),
      },
    }
    await expect(create(`/blog/cat-b2-${run}/post-${run}/`)).rejects.toMatchObject(hides)
    await expect(create(`/blog/cat-a-${run}/`)).rejects.toMatchObject(hides)
  })
})
