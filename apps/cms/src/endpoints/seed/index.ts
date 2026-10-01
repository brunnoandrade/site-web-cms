import type { CollectionSlug, File, Payload, PayloadRequest } from 'payload'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import type { Tenant, User } from '@digio/payload-types'

import { seedCampaign } from './campaign'
import { seedCatalog } from './catalog'
import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Only this tenant's documents are removed and recreated; other tenants are untouched.
// Order matters: documents that reference others are removed first, media last.
const tenantCollections: CollectionSlug[] = [
  'pages',
  'posts',
  'search',
  'redirects',
  'header',
  'footer',
  'form-submissions',
  'forms',
  'banners',
  'help-topics',
  'faqs',
  'help-categories',
  'rates',
  'products',
  'authors',
  'categories',
  'media',
]

// Current blog categories (same slugs as WordPress, see CLAUDE.md).
const categories = [
  { title: 'Empréstimos', slug: 'emprestimos' },
  { title: 'Games', slug: 'games' },
  { title: 'Meu Digio', slug: 'meu-digio' },
  { title: 'Notícias', slug: 'noticias' },
  { title: 'Salvando Grana', slug: 'salvando-grana' },
  { title: 'Segurança', slug: 'seguranca' },
]

/** Property with the full demo content; the others get the campaign content. */
const MAIN_TENANT = 'digio'

// Skips the website revalidation webhook: the website may not be running while seeding.
const context = { disableRevalidate: true }

/** Replaces the content of one tenant with the demo content of the template. */
export const seed = async ({
  payload,
  req,
  tenant,
}: {
  payload: Payload
  req: PayloadRequest
  tenant: Tenant
}): Promise<void> => {
  payload.logger.info(`Seeding tenant "${tenant.slug}"...`)

  const byTenant = { tenant: { equals: tenant.id } }

  payload.logger.info(`— Clearing the tenant's content...`)

  for (const collection of tenantCollections) {
    await payload.db.deleteMany({ collection, req, where: byTenant })
    if (payload.collections[collection].config.versions) {
      await payload.db.deleteVersions({
        collection,
        req,
        where: { 'version.tenant': { equals: tenant.id } },
      })
    }
  }

  const withTenant = <T extends object>(data: T) => ({ ...data, tenant: tenant.id })

  payload.logger.info(`— Seeding demo author...`)

  // Local account kept for the SSO collision test (docker/keycloak: sso.colisao).
  await upsertDemoUser(payload, req, tenant)

  const demoAuthor = await payload.create({
    collection: 'authors',
    req,
    context,
    data: withTenant({
      name: 'Equipe Digio',
      slug: 'equipe-digio',
      bio: 'Conteúdo produzido pelo time do Digio.',
    }),
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    readSeedFile('image-post1.webp'),
    readSeedFile('image-post2.webp'),
    readSeedFile('image-post3.webp'),
    readSeedFile('image-hero1.webp'),
  ])

  const image1Doc = await payload.create({
    collection: 'media',
    req,
    data: withTenant(image1),
    file: image1Buffer,
  })
  const image2Doc = await payload.create({
    collection: 'media',
    req,
    data: withTenant(image2),
    file: image2Buffer,
  })
  const image3Doc = await payload.create({
    collection: 'media',
    req,
    data: withTenant(image2),
    file: image3Buffer,
  })
  const imageHomeDoc = await payload.create({
    collection: 'media',
    req,
    data: withTenant(imageHero1),
    file: hero1Buffer,
  })

  // The main property (digio) gets the full demo: blog, catalog, help center and components page.
  // Any other property is a campaign micro-site with its own, smaller content.
  if (tenant.slug !== MAIN_TENANT) {
    await seedCampaign({
      payload,
      req,
      tenant,
      images: [imageHomeDoc, image1Doc, image2Doc],
      context,
    })
    payload.logger.info(`Seeded tenant "${tenant.slug}" successfully!`)
    return
  }

  const categoryDocs = await Promise.all(
    categories.map((category) =>
      payload.create({ collection: 'categories', req, context, data: withTenant(category) }),
    ),
  )
  const categoryBySlug = (slug: string) => categoryDocs.find((doc) => doc.slug === slug)!

  payload.logger.info(`— Seeding posts...`)

  // Created in order so they can be sorted by `createdAt` or `publishedAt`
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    req,
    context,
    data: withTenant(
      post1({
        heroImage: image1Doc,
        blockImage: image2Doc,
        author: demoAuthor,
        category: categoryBySlug('noticias'),
      }),
    ),
  })
  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    req,
    context,
    data: withTenant(
      post2({
        heroImage: image2Doc,
        blockImage: image3Doc,
        author: demoAuthor,
        category: categoryBySlug('salvando-grana'),
      }),
    ),
  })
  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    req,
    context,
    data: withTenant(
      post3({
        heroImage: image3Doc,
        blockImage: image1Doc,
        author: demoAuthor,
        category: categoryBySlug('seguranca'),
      }),
    ),
  })

  const related: [number, number[]][] = [
    [post1Doc.id, [post2Doc.id, post3Doc.id]],
    [post2Doc.id, [post1Doc.id, post3Doc.id]],
    [post3Doc.id, [post1Doc.id, post2Doc.id]],
  ]
  for (const [id, relatedPosts] of related) {
    await payload.update({ collection: 'posts', id, req, context, data: { relatedPosts } })
  }

  payload.logger.info(`— Seeding contact form and pages...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    req,
    data: withTenant(contactFormData),
  })

  const contactPage = await payload.create({
    collection: 'pages',
    depth: 0,
    req,
    context,
    data: withTenant(contactPageData({ contactForm })),
  })

  payload.logger.info(`— Seeding header and footer...`)

  await payload.create({
    collection: 'header',
    req,
    context,
    data: withTenant({
      enableCta: true,
      cta: { type: 'custom' as const, label: 'Abrir conta', url: '/' },
      navItems: [
        { link: { type: 'custom' as const, label: 'Cartão', url: '/componentes/' } },
        { link: { type: 'custom' as const, label: 'Ajuda', url: '/central-de-ajuda/' } },
        { link: { type: 'custom' as const, label: 'Blog', url: '/blog/' } },
        {
          link: {
            type: 'reference' as const,
            label: 'Contato',
            reference: { relationTo: 'pages' as const, value: contactPage.id },
          },
        },
      ],
    }),
  })
  await payload.create({
    collection: 'footer',
    req,
    context,
    data: withTenant({
      columns: [
        {
          title: 'Produtos',
          links: [
            { link: { type: 'custom' as const, label: 'Cartão de crédito', url: '/componentes/' } },
            { link: { type: 'custom' as const, label: 'Conta digital', url: '/componentes/' } },
            {
              link: { type: 'custom' as const, label: 'Empréstimo pessoal', url: '/componentes/' },
            },
          ],
        },
        {
          title: 'Ajuda',
          links: [
            {
              link: {
                type: 'custom' as const,
                label: 'Central de ajuda',
                url: '/central-de-ajuda/',
              },
            },
            {
              link: {
                type: 'reference' as const,
                label: 'Fale com a gente',
                reference: { relationTo: 'pages' as const, value: contactPage.id },
              },
            },
          ],
        },
        {
          title: 'Digio',
          links: [
            { link: { type: 'custom' as const, label: 'Blog', url: '/blog/' } },
            {
              link: {
                type: 'custom' as const,
                label: 'Site atual',
                newTab: true,
                url: 'https://www.digio.com.br/',
              },
            },
          ],
        },
      ],
      legalText:
        'Banco Digio S.A. Conteúdo de demonstração do ambiente local. Produtos sujeitos a análise de crédito e às condições vigentes.',
    }),
  })

  payload.logger.info(
    `— Seeding products, rates, FAQs, help center, banner, components page and home...`,
  )

  const { faqs } = await seedCatalog({ payload, req, tenant, image: imageHomeDoc, context })

  await payload.create({
    collection: 'pages',
    depth: 0,
    req,
    context,
    data: withTenant(
      home({ heroImage: imageHomeDoc, cardImages: [image1Doc, image2Doc, image3Doc], faqs }),
    ),
  })

  payload.logger.info(`Seeded tenant "${tenant.slug}" successfully!`)
}

/** Local demo account shared by all tenants; it gets an `editor` row on each seeded tenant. */
async function upsertDemoUser(
  payload: Payload,
  req: PayloadRequest,
  tenant: Tenant,
): Promise<User> {
  const email = 'demo-author@example.com'
  const { docs } = await payload.find({
    collection: 'users',
    req,
    depth: 0,
    where: { email: { equals: email } },
  })

  if (!docs[0]) {
    return payload.create({
      collection: 'users',
      req,
      data: {
        name: 'Demo Author',
        email,
        password: crypto.randomUUID(),
        tenants: [{ tenant: tenant.id, roles: ['editor'] }],
      },
    })
  }

  const tenants = docs[0].tenants ?? []
  const hasTenant = tenants.some((row) =>
    typeof row.tenant === 'object' ? row.tenant.id === tenant.id : row.tenant === tenant.id,
  )
  if (hasTenant) return docs[0]

  return payload.update({
    collection: 'users',
    id: docs[0].id,
    req,
    data: { tenants: [...tenants, { tenant: tenant.id, roles: ['editor'] }] },
  })
}

async function readSeedFile(name: string): Promise<File> {
  const data = await readFile(path.resolve(dirname, name))

  return {
    name,
    data,
    mimetype: 'image/webp',
    size: data.byteLength,
  }
}
