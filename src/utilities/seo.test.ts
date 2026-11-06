import { describe, expect, it } from 'vitest'

import type { Tenant } from '@/lib/cms'

import {
  SEO_ROBOTS,
  buildMetadata,
  collapse,
  lexicalText,
  robotsOf,
  seoDescription,
  seoTitle,
} from './seo'

const tenant = (extra: Partial<Tenant> = {}) =>
  ({ name: 'Uber Conta', siteUrl: 'https://uberconta.example', ...extra }) as Tenant

describe('seoTitle', () => {
  it('uses the property suffix', () => {
    expect(seoTitle(tenant({ seoTitleSuffix: ' • Uber Conta' }), 'Cartão')).toBe(
      'Cartão • Uber Conta',
    )
  })

  it('falls back to " | <name>" and to the name without a title', () => {
    expect(seoTitle(tenant(), 'Cartão')).toBe('Cartão | Uber Conta')
    expect(seoTitle(tenant(), null)).toBe('Uber Conta')
  })
})

describe('buildMetadata', () => {
  const meta = buildMetadata({
    tenant: tenant({ seoTitleSuffix: ' • Uber Conta' }),
    path: '/cartao',
    title: 'Cartão',
    description: 'Descrição',
    keywords: 'a, b',
  })

  it('puts the suffix only in the <title>', () => {
    expect(meta.title).toBe('Cartão • Uber Conta')
    expect(meta.openGraph?.title).toBe('Cartão')
    expect(meta.twitter?.title).toBe('Cartão')
  })

  it('sets canonical, robots and keywords', () => {
    expect(meta.alternates?.canonical).toBe('https://uberconta.example/cartao')
    expect(meta.robots).toEqual(SEO_ROBOTS)
    expect(meta.keywords).toBe('a, b')
  })

  it('keeps search results out of the index', () => {
    const noindex = buildMetadata({
      tenant: tenant(),
      path: '/busca',
      title: 'Busca',
      noindex: true,
    })
    expect(noindex.robots).toEqual({ index: false, follow: true })
  })

  it('marks articles', () => {
    const article = buildMetadata({
      tenant: tenant(),
      path: '/blog/x',
      title: 'X',
      type: 'article',
    })
    expect(article.openGraph).toMatchObject({ type: 'article' })
  })
})

describe('lexicalText', () => {
  it('joins the text of every node', () => {
    const tree = {
      children: [
        { children: [{ text: 'Olá' }, { text: 'mundo' }] },
        { children: [{ children: [{ text: 'item' }] }] },
      ],
    }
    expect(collapse(lexicalText(tree))).toBe('Olá mundo item')
  })
})

describe('robotsOf', () => {
  it('is open by default and noindex for search result pages', () => {
    expect(robotsOf(tenant())).toEqual(SEO_ROBOTS)
    expect(robotsOf(tenant(), true)).toEqual({ index: false, follow: true })
  })

  it('closes every page of a property with blocked indexing', () => {
    expect(robotsOf(tenant({ blockIndexing: true }))).toEqual({ index: false, follow: false })
    expect(robotsOf(tenant({ blockIndexing: true }), true)).toEqual({ index: false, follow: false })
  })
})

describe('seoDescription', () => {
  it('uses the page description, then the property default', () => {
    const t = tenant({ seoDefaultDescription: 'Padrão' })
    expect(seoDescription(t, 'Da página')).toBe('Da página')
    expect(seoDescription(t, '')).toBe('Padrão')
    expect(seoDescription(tenant(), null)).toBeUndefined()
  })

  it('reaches buildMetadata (description, og and twitter)', () => {
    const meta = buildMetadata({ tenant: tenant({ seoDefaultDescription: 'Padrão' }), path: '/x' })
    expect(meta.description).toBe('Padrão')
    expect(meta.openGraph?.description).toBe('Padrão')
    expect(meta.twitter?.description).toBe('Padrão')
  })
})
