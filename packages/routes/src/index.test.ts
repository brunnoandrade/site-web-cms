import { describe, expect, it } from 'vitest'

import {
  blogCategoryPath,
  blogPagePath,
  documentPath,
  helpQuestionPath,
  helpTopicPath,
  parseHelpPath,
  normalizePath,
  pagePath,
  parsePostPath,
  postPath,
  toSlug,
} from './index'

describe('paths', () => {
  it('builds page and post URLs with a trailing slash', () => {
    expect(pagePath('home')).toBe('/')
    expect(pagePath('contato')).toBe('/contato/')
    expect(pagePath('cartao/beneficios')).toBe('/cartao/beneficios/')
    expect(postPath('noticias', 'meu-post')).toBe('/blog/noticias/meu-post/')
    expect(documentPath('posts', { slug: 'x', category: { slug: 'seguranca' } })).toBe(
      '/blog/seguranca/x/',
    )
  })

  it('needs the populated category to build a post URL', () => {
    expect(documentPath('posts', { slug: 'x', category: 12 })).toBeNull()
    expect(documentPath('posts', { slug: 'x' })).toBeNull()
  })

  it('builds blog listing URLs (same as WordPress)', () => {
    expect(blogCategoryPath('salvando-grana')).toBe('/blog/salvando-grana/')
    expect(blogPagePath(2)).toBe('/blog/page/2/')
    expect(blogPagePath(3, 'noticias')).toBe('/blog/noticias/page/3/')
  })

  it('parses post URLs', () => {
    expect(parsePostPath('/blog/noticias/meu-post/')).toEqual({
      categorySlug: 'noticias',
      slug: 'meu-post',
    })
    expect(parsePostPath('/blog/page/2/')).toBeNull()
    expect(parsePostPath('/blog/noticias/')).toBeNull()
  })
})

describe('help center URLs (same as the current site)', () => {
  it('builds topic and question URLs', () => {
    expect(helpTopicPath('cartao-digio')).toBe('/central-de-ajuda/cartao-digio/')
    expect(helpQuestionPath('cartao-digio', 'o-que-e-cvv')).toBe(
      '/central-de-ajuda/cartao-digio/o-que-e-cvv/',
    )
  })

  it('parses help URLs', () => {
    expect(parseHelpPath('/central-de-ajuda/pix/')).toEqual({ topicSlug: 'pix' })
    expect(parseHelpPath('/central-de-ajuda/pix/como-usar/')).toEqual({
      topicSlug: 'pix',
      questionSlug: 'como-usar',
    })
    expect(parseHelpPath('/central-de-ajuda/')).toBeNull()
    expect(parseHelpPath('/blog/pix/')).toBeNull()
  })
})

describe('toSlug (Portuguese titles)', () => {
  it.each([
    ['O cartão tem anuidade?', 'o-cartao-tem-anuidade'],
    ['Como peço o cartão?', 'como-peco-o-cartao'],
    ['Empréstimos & Crédito', 'emprestimos-e-credito'],
    ['  Ação  Nº 1 — Informações  ', 'acao-n-1-informacoes'],
    ['Pix', 'pix'],
  ])('%s -> %s', (input, expected) => {
    expect(toSlug(input)).toBe(expected)
  })
})

describe('normalizePath', () => {
  it.each([
    ['/antiga', '/antiga/'],
    ['/antiga/', '/antiga/'],
    ['antiga', '/antiga/'],
    ['//antiga//pagina', '/antiga/pagina/'],
    ['/antiga/?utm_source=x#topo', '/antiga/'],
    ['https://www.digio.com.br/cartao?gclid=1', '/cartao/'],
    ['/cart%C3%A3o/', '/cartão/'],
    ['/Cartao/', '/Cartao/'],
    ['/sitemap.xml', '/sitemap.xml'],
    ['/', '/'],
    ['  /com-espaco  ', '/com-espaco/'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizePath(input)).toBe(expected)
  })
})
