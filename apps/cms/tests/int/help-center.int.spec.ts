import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Faq, HelpCategory, Tenant } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/** Help center (/central-de-ajuda/<topico>/<pergunta>/): question slugs and redirects. */

let payload: Payload
const run = `${Date.now()}`
const context = { disableRevalidate: true }
let tenant: Tenant
let category: HelpCategory

const paragraph = (text: string) =>
  ({
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
            { type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
          ],
        },
      ],
    },
  }) as never

const faq = (question: string, extra: Partial<Faq> = {}) =>
  payload.create({
    collection: 'faqs',
    context,
    data: { question, answer: paragraph('Resposta.'), tenant: tenant.id, ...extra } as never,
  })

const topic = (slugValue: string, faqs: number[]) =>
  payload.create({
    collection: 'help-topics',
    context,
    data: {
      title: slugValue,
      slug: slugValue,
      category: category.id,
      faqs,
      tenant: tenant.id,
      _status: 'published',
    },
  })

describe('help center', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Ajuda',
        slug: `ajuda-${run}`,
        siteUrl: 'http://ajuda.local',
        domains: [{ domain: `ajuda-${run}.local` }],
      },
    })
    category = await payload.create({
      collection: 'help-categories',
      context,
      data: { title: 'Cartão', slug: 'cartao', tenant: tenant.id },
    })
  })

  afterAll(async () => {
    for (const collection of ['redirects', 'help-topics', 'faqs', 'help-categories'] as const) {
      await payload.delete({ collection, context, where: { tenant: { equals: tenant.id } } })
    }
    await payload.delete({ collection: 'tenants', id: tenant.id })
  })

  it('generates question slugs keeping Portuguese words readable', async () => {
    const doc = await faq('O cartão tem anuidade?')
    expect(doc.slug).toBe('o-cartao-tem-anuidade')
  })

  it('refuses two questions with the same slug in a topic', async () => {
    const a = await faq('Como peço o cartão?')
    const b = await faq('Como peço o cartão?!')
    expect(a.slug).toBe(b.slug)
    await expect(topic('duplicado', [a.id, b.id])).rejects.toMatchObject({
      data: { errors: [expect.objectContaining({ message: expect.stringMatching(/mesmo slug/) })] },
    })
  })

  it('always gives a question a slug, even when left empty', async () => {
    const doc = await faq('Sem endereço definido', { slug: '' } as never)
    expect(doc.slug).toBe('sem-endereco-definido')
  })

  it('a redirect cannot hide a published topic or question page', async () => {
    const question = await faq('O que é CVV?')
    await topic('cartao-digio', [question.id])
    const create = (from: string) =>
      payload.create({
        collection: 'redirects',
        context,
        data: { tenant: tenant.id, from, to: { type: 'custom', url: '/x/' } },
      })
    const hides = {
      data: {
        errors: expect.arrayContaining([
          expect.objectContaining({ message: expect.stringMatching(/esconderia/) }),
        ]),
      },
    }
    await expect(create('/central-de-ajuda/cartao-digio/')).rejects.toMatchObject(hides)
    await expect(create('/central-de-ajuda/cartao-digio/o-que-e-cvv/')).rejects.toMatchObject(hides)
    // An old question URL that no longer exists can be redirected.
    const ok = await create('/central-de-ajuda/cartao-digio/pergunta-antiga/')
    expect(ok.id).toBeDefined()
  })
})
