import { describe, expect, it } from 'vitest'

import { internalPath, policyRedirect, styledDestination } from './urlPolicy'

const digio = {}
const uber = { trailingSlash: false, flatPosts: true }

describe('policyRedirect', () => {
  it('adds the trailing slash for Digio (308) and leaves slashed URLs alone', () => {
    expect(policyRedirect('/cartao', '?utm=a', digio)).toEqual({
      location: '/cartao/?utm=a',
      status: 308,
    })
    expect(policyRedirect('/cartao/', '', digio)).toBeNull()
    expect(policyRedirect('/', '', digio)).toBeNull()
    expect(policyRedirect('/sitemap.xml', '', digio)).toBeNull()
  })

  it('removes the trailing slash for Uber Conta (301), keeping the query string', () => {
    expect(policyRedirect('/pix/', '?gclid=1', uber)).toEqual({
      location: '/pix?gclid=1',
      status: 301,
    })
    expect(policyRedirect('/pix', '', uber)).toBeNull()
    expect(policyRedirect('/', '', uber)).toBeNull()
  })

  it('sends the WordPress blog URLs to the flat ones', () => {
    expect(policyRedirect('/blog/vantagens/meu-post/', '', uber)).toEqual({
      location: '/blog/meu-post',
      status: 301,
    })
    expect(policyRedirect('/blog/page/2/', '', uber)).toEqual({
      location: '/blog?page=2',
      status: 301,
    })
    expect(policyRedirect('/blog/vantagens/page/3/', '', uber)).toEqual({
      location: '/blog?categoria=vantagens&page=3',
      status: 301,
    })
    expect(policyRedirect('/blog/meu-post', '', uber)).toBeNull()
    expect(policyRedirect('/blog', '?categoria=vantagens', uber)).toBeNull()
  })

  it('does not touch the blog URLs of a property with categories in the URL', () => {
    expect(policyRedirect('/blog/vantagens/meu-post/', '', digio)).toBeNull()
  })
})

describe('internalPath / styledDestination', () => {
  it('internal routes always carry the slash', () => {
    expect(internalPath('/pix')).toBe('/pix/')
    expect(internalPath('/pix/')).toBe('/pix/')
    expect(internalPath('/')).toBe('/')
    expect(internalPath('/robots.txt')).toBe('/robots.txt')
  })

  it('writes relative redirect destinations in the property form', () => {
    expect(styledDestination('/cartao/?x=1', { trailingSlash: false })).toBe('/cartao?x=1')
    expect(styledDestination('https://outro.com/a/', { trailingSlash: false })).toBe(
      'https://outro.com/a/',
    )
  })
})
