/**
 * Brings the Uber Conta home blocks (solutions video and icons, blog carousel, divider, FAQ cards)
 * to the seed's current state without touching the rest of the page (the seed would recreate all
 * the tenant content). Usage: npm run -w cms uber:home. Uploads files again on every run.
 */
import config from '@payload-config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import { richHeading } from '../src/endpoints/seed/uber-product-page'

const dir = path.resolve(process.cwd(), 'src/endpoints/seed/uber-conta-assets')
const payload = await getPayload({ config })

const { docs: tenants } = await payload.find({
  collection: 'tenants',
  where: { slug: { equals: 'uber-conta' } },
  limit: 1,
})
const tenant = tenants[0]
if (!tenant) throw new Error('Tenant uber-conta not found')

const upload = async (file: string, alt: string, mimetype: string) => {
  const data = await readFile(path.join(dir, file))
  const doc = await payload.create({
    collection: 'media',
    data: { alt, tenant: tenant.id },
    file: { name: file, data, mimetype, size: data.byteLength },
  })
  return doc.id
}

const { docs } = await payload.find({
  collection: 'pages',
  where: { and: [{ slug: { equals: 'home' } }, { tenant: { equals: tenant.id } }] },
  depth: 0,
  limit: 1,
})
const page = docs[0]
if (!page) throw new Error('Home page not found')

if (page.hero && !page.hero.video) {
  page.hero.video = await upload('hero.mp4', 'Celular com o app Uber Conta', 'video/mp4')
  page.hero.videoMobile = await upload(
    'hero-mobile.mp4',
    'Celular com o app Uber Conta',
    'video/mp4',
  )
}

const icons: Record<string, string> = {
  'Débitos Veiculares': 'vehicle',
  'Uber Conta Desconto': 'discount',
  'Uber Chip': 'chip',
  'Seguro Celular': 'security',
  'Tag Veloe': 'tag',
  'Atendimento 24h': 'support',
}

const layout = JSON.parse(JSON.stringify(page.layout ?? []))
const block = layout.find(
  (b: { blockType: string; anchor?: string }) => b.blockType === 'cards' && b.anchor === 'solucoes',
)
if (!block) throw new Error('Block "solucoes" not found')

if (!block.video) {
  block.video = await upload('solutions.mp4', 'Celulares com o app Uber Conta', 'video/mp4')
  block.enableSectionLink = true
  block.sectionLink = {
    type: 'custom',
    url: '#solucoes-lista',
    label: 'Aproveitar soluções',
    newTab: false,
  }
  for (const item of block.items) {
    const name = icons[item.title]
    if (name) item.image = await upload(`solution-${name}.png`, item.title, 'image/png')
  }
}

if (!block.videoMobile) {
  block.videoMobile = await upload(
    'solutions-mobile.mp4',
    'Celulares com o app Uber Conta',
    'video/mp4',
  )
}

const blog = layout.find(
  (b: { blockType: string; anchor?: string }) => b.blockType === 'archive' && b.anchor === 'blog',
)
if (blog) {
  blog.variant = 'carousel'
  blog.eyebrow = 'Uber Blog'
  blog.feedUrl = 'https://medium.com/feed/@ubercontabrasil'
  blog.moreLink = {
    type: 'custom',
    url: 'https://medium.com/@ubercontabrasil',
    label: 'Ir para o Blog',
    newTab: true,
  }
  blog.limit = 6
  blog.introContent = richHeading('h2', 'Conteúdo\nrelevante\npara seu dia a dia')
}

const faqIndex = layout.findIndex(
  (b: { blockType: string; anchor?: string }) => b.blockType === 'faq' && b.anchor === 'ajuda',
)
if (faqIndex >= 0) {
  layout[faqIndex].variant = 'cards'
  layout[faqIndex].theme = 'light'
  const hasDivider = layout[faqIndex - 1]?.blockType === 'mediaBlock'
  if (!hasDivider) {
    layout.splice(faqIndex, 0, {
      blockType: 'mediaBlock',
      media: await upload('divider.jpg', 'Uber Conta', 'image/jpeg'),
      mediaMobile: await upload('divider-mobile.jpg', 'Uber Conta', 'image/jpeg'),
    })
  }
}

await payload.update({
  collection: 'pages',
  id: page.id,
  data: { layout, hero: page.hero },
  depth: 0,
})
console.log('Home do Uber Conta atualizada.')
process.exit(0)
