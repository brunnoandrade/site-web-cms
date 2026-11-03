import { describe, expect, it } from 'vitest'

import type { Tenant } from '@/lib/cms'

import { SEO_ROBOTS, buildMetadata, collapse, lexicalText, seoTitle } from './seo'

const tenant = (extra: Partial<Tenant> = {}) =>
  ({ name: 'Uber Conta', siteUrl: 'https://uberconta.example', ...extra }) as Tenant

describe('seoTitle', () => {
  it('uses the property suffix', () => {
    expect(seoTitle(tenant({ seoTitleSuffix: ' • Uber Conta' }), 'Cartão')).toBe('Cartão • Uber Conta')
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
    const noindex = buildMetadata({ tenant: tenant(), path: '/busca', title: 'Busca', noindex: true })
    expect(noindex.robots).toEqual({ index: false, follow: true })
  })

  it('marks articles', () => {
    const article = buildMetadata({ tenant: tenant(), path: '/blog/x', title: 'X', type: 'article' })
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
