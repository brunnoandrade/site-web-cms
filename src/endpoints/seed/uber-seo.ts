/**
 * SEO data of the current Uber Conta site (titles, descriptions, keywords in
 * scripts/uber-pages/data-seo/seo.json, captured with scripts/seo-audit.py) applied to the CMS:
 * the meta of pages and posts, and the property's SEO defaults (title suffix, share image).
 * Safe to run again.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'

type Entry = { title: string; description: string; keywords: string | null }

const dataFile = fileURLToPath(
  new URL('../../../scripts/uber-pages/data-seo/seo.json', import.meta.url),
)
const llmsFile = fileURLToPath(
  new URL('../../../scripts/uber-pages/data-seo/llms.txt', import.meta.url),
)
const assetsDir = fileURLToPath(new URL('./uber-conta-assets', import.meta.url))

export const seedUberSeo = async (payload: Payload) => {
  const seo = JSON.parse(await readFile(dataFile, 'utf8')) as Record<string, Entry>

  const { docs: tenants } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'uber-conta' } },
    limit: 1,
  })
  const tenant = tenants[0]
  if (!tenant) throw new Error('Tenant uber-conta not found')

  // Property defaults: title suffix and the share image.
  const { docs: existing } = await payload.find({
    collection: 'media',
    where: { and: [{ filename: { contains: 'share' } }, { tenant: { equals: tenant.id } }] },
    limit: 1,
    depth: 0,
  })
  let shareId = existing[0]?.id
  if (!shareId) {
    const data = await readFile(path.join(assetsDir, 'share.png'))
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Uber Conta', tenant: tenant.id },
      file: { name: 'share.png', data, mimetype: 'image/png', size: data.byteLength },
    })
    shareId = media.id
  }
  await payload.update({
    collection: 'tenants',
    id: tenant.id,
    data: {
      seoTitleSuffix: ' • Uber Conta',
      seoDefaultImage: shareId,
      llmsTxt: await readFile(llmsFile, 'utf8'),
      // Interface texts and app of the property (editable in the admin; these are the current ones).
      uiTexts: {
        readMoreBlog: 'Leia no Blog',
        relatedQuestions: 'Assuntos relacionados',
        helpTitle: 'Central de Ajuda',
        crumbHome: 'Home',
        crumbHelp: 'Ajuda',
        searchPageTitle: 'Busca',
        searchSuggestions: 'Sugestões:',
        searchNoResults: 'Nenhuma sugestão encontrada',
        searchClear: 'Limpar busca',
        popularSearches: [{ term: 'Pix' }, { term: 'Empréstimos' }, { term: 'Aplicativo' }],
      },
      app: {
        name: 'Uber Conta',
        androidUrl: 'https://play.google.com/store/apps/details?id=br.com.digio.uber',
        iosUrl: 'http://apps.apple.com/us/app/uber-conta/id1550784531',
      },
    },
  })

  let updated = 0
  const missing: string[] = []
  for (const [route, entry] of Object.entries(seo)) {
    const post = route.match(/^\/blog\/([^/?]+)$/)
    const slug = post ? post[1]! : route === '/' ? 'home' : route.replace(/^\//, '')
    // Questions and categories of the help center take their SEO from their own content.
    if (route.includes('?') || (!post && slug.includes('/'))) continue
    if (!post && slug.startsWith('central-de-ajuda') && slug !== 'central-de-ajuda') continue

    const collection = post ? 'posts' : 'pages'
    const { docs } = await payload.find({
      collection,
      where: { and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }] },
      limit: 1,
      depth: 0,
    })
    const doc = docs[0]
    if (!doc) {
      missing.push(route)
      continue
    }
    await payload.update({
      collection,
      id: doc.id,
      data: {
        meta: {
          ...(doc.meta ?? {}),
          title: entry.title || undefined,
          description: entry.description || undefined,
          keywords: entry.keywords || undefined,
        },
      },
    })
    updated++
  }
  return { updated, missing }
}
