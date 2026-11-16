import { describe, expect, it } from 'vitest'

import type { Tenant } from '@/lib/cms'
import type { Post } from '@/payload-types'

import { buildMetadata } from '@/utilities/seo'
import { hasFlatHelp, localeOf, siteSearchPath } from './helpStyle'
import { appNode, authorNodes, blogPostingNode, siteNodes } from './jsonld'
import { webManifest } from './manifest'
import { themeColorOf } from './themes'
import { robotsTxt } from './robots'
import { latestDate, mergeSitemapEntries, postSitemapEntry } from './sitemaps'

/**
 * Contract: everything the site emits for a property comes from that property's own data, with no
 * rule tied to a tenant name. Two fictitious properties with opposite choices must both work.
 */
const tenants = {
  alfa: {
    slug: 'alfa',
    name: 'Alfa',
    siteUrl: 'https://alfa.example',
    updatedAt: '2026-01-01T00:00:00.000Z',
    trailingSlash: true,
    blogUrlStyle: 'category',
    seoTitleSuffix: ' | Alfa',
    blockIndexing: false,
    robotsExtra: 'Disallow: /busca/\n\n# comentário',
    helpStyle: 'topics',
    locale: 'en-US',
  },
  beta: {
    slug: 'beta',
    name: 'Beta',
    siteUrl: 'https://www.beta.example',
    updatedAt: '2026-02-01T00:00:00.000Z',
    trailingSlash: false,
    blogUrlStyle: 'flat',
    blockIndexing: true,
    helpStyle: 'flat',
    themeColor: '#112233',
    app: { name: 'Beta App', androidUrl: 'https://play.example/beta' },
    company: { legalName: 'Beta S.A.' },
    socials: [{ network: 'instagram', url: 'https://instagram.com/beta' }],
  },
} as unknown as Record<string, Tenant>

describe.each(Object.values(tenants))('property $slug', (tenant) => {
  it('robots.txt points to its own sitemap', () => {
    expect(robotsTxt(tenant)).toContain(`Sitemap: ${tenant.siteUrl}/sitemap.xml`)
  })

  it('sitemap lists each URL once, on its own host', () => {
    const entry = (path: string) => ({ loc: `${tenant.siteUrl}${path}`, lastmod: tenant.updatedAt })
    const merged = mergeSitemapEntries([entry('/a'), entry('/b')], [entry('/b'), entry('/c')])
    expect(merged.map((e) => e.loc)).toEqual([
      `${tenant.siteUrl}/a`,
      `${tenant.siteUrl}/b`,
      `${tenant.siteUrl}/c`,
    ])
    expect(merged.every((e) => e.loc.startsWith(tenant.siteUrl))).toBe(true)
  })

  it('metadata uses its name, host and robots', () => {
    const meta = buildMetadata({ tenant, path: '/x', title: 'Página' })
    expect(meta.alternates?.canonical).toBe(`${tenant.siteUrl}/x`)
    expect(meta.openGraph).toMatchObject({ siteName: tenant.name, url: `${tenant.siteUrl}/x` })
    expect(String(meta.title)).toContain('Página')
    expect(String(meta.title)).toContain(tenant.name)
    expect(meta.robots).toMatchObject({ index: !tenant.blockIndexing })
  })

  it('structured data names the property and no other', () => {
    const json = JSON.stringify(siteNodes(tenant))
    expect(json).toContain(tenant.siteUrl)
    expect(json).toContain(`"name":"${tenant.name}"`)
    for (const other of Object.values(tenants).filter((t) => t.slug !== tenant.slug)) {
      expect(json).not.toContain(other.siteUrl)
    }
  })

  it('manifest carries its name and an icon', () => {
    const manifest = webManifest(tenant)
    expect(manifest.name).toBe(tenant.name)
    expect(manifest.icons[0]?.src).toBeTruthy()
  })
})

describe('differences between properties come from their data', () => {
  it('blocked indexing closes robots.txt; the extra rules only apply to open ones', () => {
    expect(robotsTxt(tenants.beta)).toContain('Disallow: /\n')
    expect(robotsTxt(tenants.beta)).not.toContain('/api/')
    expect(robotsTxt(tenants.alfa)).toContain('Disallow: /busca/')
  })

  it('only a property with company data and socials lists them', () => {
    expect(JSON.stringify(siteNodes(tenants.beta))).toContain('Beta S.A.')
    expect(JSON.stringify(siteNodes(tenants.alfa))).not.toContain('legalName')
    expect(JSON.stringify(siteNodes(tenants.alfa))).not.toContain('sameAs')
  })
})

describe('policies come from the property, not from its name', () => {
  it('help center structure and site search', () => {
    expect(hasFlatHelp(tenants.alfa)).toBe(false)
    expect(siteSearchPath(tenants.alfa)).toBeUndefined()
    expect(hasFlatHelp(tenants.beta)).toBe(true)
    expect(siteSearchPath(tenants.beta)).toBe('/central-de-ajuda/busca')
  })

  it("language: the property's, defaulting to pt-BR", () => {
    expect(localeOf(tenants.alfa)).toBe('en-US')
    expect(localeOf(tenants.beta)).toBe('pt-BR')
    expect(JSON.stringify(siteNodes(tenants.alfa))).toContain('"inLanguage":"en-US"')
    expect(webManifest(tenants.alfa).lang).toBe('en-US')
  })

  it('browser color', () => {
    expect(themeColorOf(tenants.beta)).toBe('#112233')
    expect(themeColorOf(tenants.alfa)).toBeUndefined()
    expect(webManifest(tenants.beta).theme_color).toBe('#112233')
  })

  it('mobile app: only a property that has one lists it', () => {
    expect(appNode(tenants.alfa)).toBeNull()
    expect(appNode(tenants.beta)).toMatchObject({
      name: 'Beta App',
      operatingSystem: 'ANDROID',
      downloadUrl: ['https://play.example/beta'],
    })
  })
})

describe('AI crawlers and installable icon', () => {
  it('blocks AI crawlers only when the property asks, keeping the general group', () => {
    const open = { ...tenants.alfa, blockAiCrawlers: true } as Tenant
    const body = robotsTxt(open)
    expect(body).toContain('User-agent: GPTBot\nDisallow: /\n')
    expect(body).toContain('User-agent: *\nDisallow: /next/')
    expect(robotsTxt(tenants.alfa)).not.toContain('GPTBot')
    expect(robotsTxt({ ...tenants.beta, blockAiCrawlers: true } as Tenant)).not.toContain('GPTBot')
  })

  it('manifest lists the install icon as 192 and 512 only when the property has one', () => {
    expect(webManifest(tenants.alfa).icons).toHaveLength(1)
    const withIcon = { ...tenants.alfa, manifestIcon: { id: 1, url: 'https://cdn.example/i.png' } }
    const icons = webManifest(withIcon as unknown as Tenant).icons
    // The platform's generic icon is not listed beside the property's own.
    expect(icons).toHaveLength(1)
    expect(icons[0]?.sizes).toBe('192x192 512x512')
  })
})

describe('sitemap dates', () => {
  it('uses the latest change, or the fallback when there is no content', () => {
    expect(latestDate(['2026-01-01', undefined, '2026-03-01', null], 'x')).toBe('2026-03-01')
    expect(latestDate([undefined], '2026-02-01')).toBe('2026-02-01')
  })
})

describe('posts', () => {
  const post = {
    title: 'Título',
    updatedAt: '2026-03-01T00:00:00.000Z',
    publishedAt: '2026-02-01T00:00:00.000Z',
    heroImage: { id: 1, url: 'https://cdn.example/a.png' },
    authors: [{ id: 1, name: 'Ana', bio: 'Jornalista' }],
    category: { id: 1, title: 'Notícias', slug: 'noticias' },
  } as unknown as Post

  it('lists the hero image in the sitemap with an absolute URL', () => {
    const entry = postSitemapEntry(tenants.alfa, post, '/blog/noticias/titulo/', 'x')
    expect(entry.loc).toBe('https://alfa.example/blog/noticias/titulo/')
    expect(entry.images?.[0]?.loc.toString()).toBe('https://cdn.example/a.png')
  })

  it('has no images without a picture', () => {
    const entry = postSitemapEntry(
      tenants.beta,
      { ...post, heroImage: null } as unknown as Post,
      '/blog/titulo',
      'x',
    )
    expect(entry.images).toBeUndefined()
  })

  it('credits the authors as Person, or the organization without authors', () => {
    expect(authorNodes(tenants.alfa, post)).toEqual([
      { '@type': 'Person', name: 'Ana', description: 'Jornalista' },
    ])
    expect(authorNodes(tenants.beta, { authors: [] } as unknown as Post)).toEqual([
      { '@type': 'Organization', '@id': 'https://www.beta.example/#organization' },
    ])
  })

  it('BlogPosting has the author and the section', () => {
    const node = blogPostingNode(tenants.alfa, post, '/blog/noticias/titulo/', 'texto') as Record<
      string,
      unknown
    >
    expect(node.articleSection).toBe('Notícias')
    expect(node.author).toHaveLength(1)
  })
})
