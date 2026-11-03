/** Shared by the Uber Conta content seeds (uber-content.ts): tenant, media and FAQ upserts. */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'

import { htmlToLexical } from './uber-product-page'

export const dir = fileURLToPath(new URL('./uber-conta-assets', import.meta.url))

const mimes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
}

export async function setup(payload: Payload) {
  const { docs } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'uber-conta' } },
    limit: 1,
  })
  const tenant = docs[0]
  if (!tenant) throw new Error('Tenant uber-conta not found (run bootstrap:dev first)')

  const mediaCache = new Map<string, number>()
  const urlCache = new Map<string, string>()

  /** Uploads a file of uber-conta-assets/ to the tenant once (found again by file name). */
  const mediaId = async (file: string, alt: string) => {
    const cached = mediaCache.get(file)
    if (cached) return cached
    const { docs: found } = await payload.find({
      collection: 'media',
      where: { and: [{ filename: { equals: file } }, { tenant: { equals: tenant.id } }] },
      depth: 0,
      limit: 1,
    })
    let id = found[0]?.id
    let url = found[0]?.url ?? ''
    if (!id) {
      const data = await readFile(path.join(dir, file))
      const doc = await payload.create({
        collection: 'media',
        data: { alt, tenant: tenant.id },
        file: { name: file, data, mimetype: mimes[path.extname(file)], size: data.byteLength },
      })
      id = doc.id
      url = doc.url ?? ''
    }
    mediaCache.set(file, id)
    urlCache.set(file, url)
    return id
  }

  /** Every string of the data that names a file in uber-conta-assets/. */
  const filesOf = (value: unknown, found = new Set<string>()) => {
    if (typeof value === 'string') {
      if (/\.(png|jpe?g|webp|gif|mp4|pdf)$/i.test(value) && existsSync(path.join(dir, value)))
        found.add(value)
    } else if (Array.isArray(value)) value.forEach((v) => filesOf(v, found))
    else if (value && typeof value === 'object')
      Object.values(value).forEach((v) => filesOf(v, found))
    return found
  }

  const faqIds = new Map<string, number>()
  const upsertFaq = async (faq: {
    question: string
    answer: string
    slug?: string | null
    category?: number
  }) => {
    const cached = faqIds.get(faq.question)
    if (cached) return cached
    const { docs: found } = await payload.find({
      collection: 'faqs',
      where: { and: [{ question: { equals: faq.question } }, { tenant: { equals: tenant.id } }] },
      depth: 0,
      limit: 1,
    })
    const data = {
      question: faq.question,
      answer: htmlToLexical(faq.answer),
      ...(faq.slug ? { slug: faq.slug } : {}),
      ...(faq.category ? { category: faq.category } : {}),
      tenant: tenant.id,
    }
    const doc = found[0]
      ? await payload.update({ collection: 'faqs', id: found[0].id, data, depth: 0 })
      : await payload.create({ collection: 'faqs', data, depth: 0 })
    faqIds.set(faq.question, doc.id)
    return doc.id
  }

  /** Creates or updates the page `slug` of the tenant. */
  const upsertPage = async (slug: string, data: Record<string, unknown>) => {
    const { docs: existing } = await payload.find({
      collection: 'pages',
      where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
      depth: 0,
      limit: 1,
    })
    const body = { ...data, tenant: tenant.id } as never
    if (existing[0]) {
      await payload.update({ collection: 'pages', id: existing[0].id, data: body, depth: 0 })
      console.log(`Página /${slug}/ atualizada.`)
    } else {
      await payload.create({ collection: 'pages', data: body, depth: 0 })
      console.log(`Página /${slug}/ criada.`)
    }
  }

  return { payload, tenant, mediaId, mediaCache, urlCache, filesOf, upsertFaq, faqIds, upsertPage }
}
