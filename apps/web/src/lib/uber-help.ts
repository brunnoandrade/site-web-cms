import 'server-only'

import type { Faq, HelpCategory, HelpTopic } from '@digio/payload-types'
import { draftMode } from 'next/headers'
import { cache } from 'react'

import { find, findOne, type Tenant } from './cms'

/** Uber Conta property: its help center and blog have their own structure and design. */
export const isUberConta = (tenant: Tenant) => tenant.themePreset === 'uber-conta'
export const isUberHelp = isUberConta

// The Uber Conta help center is written without the trailing slash, like the property's URLs.
export const helpIndexHref = '/central-de-ajuda'
export const categoryPath = (slug: string) => `/central-de-ajuda/categorias?slug=${slug}`
export const questionPath = (slug: string) => `/central-de-ajuda/${slug}`

/** The CMS page `central-de-ajuda`: hero (with the search box) and the blocks after the categories. */
export const getHelpPage = cache(async (tenant: string) => {
  const { isEnabled: draft } = await draftMode()
  return findOne('pages', {
    tenant,
    draft,
    tags: ['pages_central-de-ajuda', 'help'],
    where: { slug: { equals: 'central-de-ajuda' } },
  })
})

export const getHelpCategories = cache(async (tenant: string): Promise<HelpCategory[]> => {
  const { docs } = await find('help-categories', {
    tenant,
    depth: 1,
    limit: 100,
    sort: 'order',
    tags: ['help'],
  })
  return docs
})

export const getHelpCategory = cache(async (tenant: string, slug: string) =>
  findOne('help-categories', {
    tenant,
    depth: 1,
    tags: ['help'],
    where: { slug: { equals: slug } },
  }),
)

/** Groups of a category (help topics), each with its questions in the editors' order. */
export const getCategoryGroups = cache(
  async (tenant: string, categoryId: number): Promise<HelpTopic[]> => {
    const { docs } = await find('help-topics', {
      tenant,
      depth: 1,
      limit: 50,
      sort: 'order',
      tags: ['help'],
      where: { category: { equals: categoryId } },
    })
    return docs
  },
)

export const getFaq = cache(async (tenant: string, slug: string) =>
  findOne('faqs', { tenant, depth: 1, tags: ['faqs', 'help'], where: { slug: { equals: slug } } }),
)

export const getCategoryFaqs = cache(async (tenant: string, categoryId: number): Promise<Faq[]> => {
  const { docs } = await find('faqs', {
    tenant,
    depth: 0,
    limit: 100,
    tags: ['faqs', 'help'],
    where: { category: { equals: categoryId } },
  })
  return docs
})

const plain = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const { text, children } = node as { text?: string; children?: unknown[] }
  return `${text ?? ''} ${Array.isArray(children) ? children.map(plain).join(' ') : ''}`
}

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Questions whose text or answer contains every word of the search (accents and case ignored). */
export const searchFaqs = async (tenant: string, query: string): Promise<Faq[]> => {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const { docs } = await find('faqs', { tenant, depth: 0, limit: 500, tags: ['faqs', 'help'] })
  return docs.filter((faq) => {
    const text = normalize(`${faq.question} ${plain((faq.answer as { root?: unknown })?.root)}`)
    return faq.slug && words.every((word) => text.includes(word))
  })
}

export const helpIndexLabel = 'Ajuda'
