/**
 * Uber Conta content that is not part of the base seed: the inner pages, the help center and the
 * blog, from the JSON files in scripts/uber-pages/ (made by the extract*.py scripts from the
 * current site). Everything is created through the Local API, so the files of
 * seed/uber-conta-assets/ go to the media storage (S3/MinIO) and to the database in one step.
 * Called by `bootstrap:dev` (right after the seed, which clears the tenant) and by
 * `npm run -w cms uber:pages | uber:help | uber:blog`. Safe to run again.
 */
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { Payload, RichTextField, Where } from 'payload'

import { attachMediaToImages } from '../../wordpress/html'
import {
  countHtml,
  countLexical,
  describeLoss,
  numericUploadIDs,
} from '../../wordpress/contentCheck'
import {
  buildAboutPage,
  buildDocumentsPage,
  buildHelpPage,
  type AboutPage,
  type DocumentsPage,
  type HelpData,
} from './uber-other-pages'
import { buildProductPage, heroRichText, type ProductPage } from './uber-product-page'
import { setup } from './uber-tools'

/** Product pages, "sobre" and "informações financeiras" (scripts/uber-pages/data/*.json). */
export async function seedUberPages(payload: Payload, only?: string[]) {
  const dataDir = fileURLToPath(new URL('../../../scripts/uber-pages/data', import.meta.url))

  const slugs = readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
    .filter((slug) => !only?.length || only.includes(slug))

  const { mediaId, mediaCache, urlCache, filesOf, upsertFaq, faqIds, upsertPage } =
    await setup(payload)

  for (const slug of slugs) {
    const raw = JSON.parse(await readFile(path.join(dataDir, `${slug}.json`), 'utf8')) as
      | (ProductPage & { kind?: undefined })
      | (AboutPage & { kind: 'about' })
      | (DocumentsPage & { kind: 'documents' })

    for (const file of filesOf(raw)) await mediaId(file, raw.title)
    const ids = {
      media: (file: string) => mediaCache.get(file)!,
      url: (file: string) => urlCache.get(file)!,
      faq: (q: string) => faqIds.get(q)!,
    }

    let built: Record<string, unknown>
    if (raw.kind === 'about') built = buildAboutPage(raw, ids)
    else if (raw.kind === 'documents') built = buildDocumentsPage(raw, ids)
    else {
      for (const { question, answer, slug: faqSlug } of raw.faqs ?? [])
        await upsertFaq({ question, answer, slug: faqSlug })
      built = buildProductPage(raw, ids)
    }

    await upsertPage(slug, built)
  }
}

type Help = HelpData & {
  categories: {
    title: string
    slug: string
    description?: string | null
    icon?: string | null
    groups: { title?: string | null; faqs: string[] }[]
  }[]
  faqs: { question: string; slug: string; category?: string | null; answer: string }[]
}

/** Help center: categories, questions, groups and the home page. */
export async function seedUberHelp(payload: Payload) {
  const help = JSON.parse(
    await readFile(
      fileURLToPath(new URL('../../../scripts/uber-pages/data-help/help.json', import.meta.url)),
      'utf8',
    ),
  ) as Help

  const { tenant, mediaId, mediaCache, urlCache, filesOf, upsertFaq, faqIds, upsertPage } =
    await setup(payload)

  for (const file of filesOf(help)) await mediaId(file, 'Central de ajuda')

  const where = (slug: string): Where => ({
    and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }],
  })

  // Categories.
  const categoryIds = new Map<string, number>()
  for (const [order, category] of help.categories.entries()) {
    const data = {
      title: category.title,
      slug: category.slug,
      description: category.description ?? undefined,
      icon: category.icon ? mediaCache.get(category.icon) : undefined,
      order,
      tenant: tenant.id,
    }
    const { docs } = await payload.find({
      collection: 'help-categories',
      where: where(category.slug),
      depth: 0,
      limit: 1,
    })
    const doc = docs[0]
      ? await payload.update({ collection: 'help-categories', id: docs[0].id, data, depth: 0 })
      : await payload.create({ collection: 'help-categories', data, depth: 0 })
    categoryIds.set(category.slug, doc.id)
  }

  // Questions.
  for (const faq of help.faqs) {
    await upsertFaq({
      question: faq.question,
      answer: faq.answer,
      slug: faq.slug,
      category: faq.category ? categoryIds.get(faq.category) : undefined,
    })
  }
  const faqBySlug = new Map(help.faqs.map((faq) => [faq.slug, faqIds.get(faq.question)!]))

  // Groups of each category (a category without group titles gets one group with its own title).
  for (const category of help.categories) {
    for (const [order, group] of category.groups.entries()) {
      const title = group.title || category.title
      const slug = group.title
        ? `${category.slug}-${group.title
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')}`
        : category.slug
      const data = {
        title,
        slug,
        order,
        category: categoryIds.get(category.slug)!,
        faqs: group.faqs.map((faqSlug) => faqBySlug.get(faqSlug)!).filter(Boolean),
        _status: 'published' as const,
        tenant: tenant.id,
      }
      const { docs } = await payload.find({
        collection: 'help-topics',
        where: where(slug),
        depth: 0,
        limit: 1,
        draft: true,
      })
      if (docs[0])
        await payload.update({
          collection: 'help-topics',
          id: docs[0].id,
          data: data as never,
          depth: 0,
        })
      else await payload.create({ collection: 'help-topics', data: data as never, depth: 0 })
    }
  }

  await upsertPage(
    'central-de-ajuda',
    buildHelpPage(help, {
      media: (file) => mediaCache.get(file)!,
      url: (file) => urlCache.get(file)!,
      faq: (q) => faqIds.get(q)!,
    }),
  )
  console.log(`${help.faqs.length} perguntas, ${help.categories.length} categorias.`)
}

type Blog = {
  title: string
  metaDescription?: string | null
  hero: {
    tagline?: string | null
    title: string
    text?: string | null
    image: string
    imageMobile?: string | null
  }
  categories: { title: string; slug: string }[]
  posts: {
    title: string
    slug: string
    description: string
    publishedAt: string
    image?: string | null
    categories: string[]
    author?: string | null
    html: string
  }[]
}

/** Blog: categories, author, posts and the listing page. */
export async function seedUberBlog(payload: Payload) {
  const blog = JSON.parse(
    await readFile(
      fileURLToPath(new URL('../../../scripts/uber-pages/data-help/blog.json', import.meta.url)),
      'utf8',
    ),
  ) as Blog

  const { tenant, mediaId, mediaCache, filesOf, upsertPage } = await setup(payload)
  for (const file of filesOf(blog)) await mediaId(file, 'Blog')
  // Images inside the posts: <img src="file"> (the extractor saved them as local files).
  for (const post of blog.posts) {
    for (const [, file] of post.html.matchAll(/<img[^>]*?src="([^"]+)"/g))
      await mediaId(file, post.title)
  }

  const where = (slug: string): Where => ({
    and: [{ slug: { equals: slug } }, { tenant: { equals: tenant.id } }],
  })

  const categoryIds = new Map<string, number>()
  for (const category of blog.categories) {
    const data = { title: category.title, slug: category.slug, tenant: tenant.id }
    const { docs } = await payload.find({
      collection: 'categories',
      where: where(category.slug),
      depth: 0,
      limit: 1,
    })
    const doc = docs[0]
      ? await payload.update({ collection: 'categories', id: docs[0].id, data, depth: 0 })
      : await payload.create({ collection: 'categories', data, depth: 0 })
    categoryIds.set(category.slug, doc.id)
  }

  // One author for every post (the current site shows the brand).
  const { docs: authors } = await payload.find({
    collection: 'authors',
    where: where('uber'),
    depth: 0,
    limit: 1,
  })
  const author =
    authors[0] ??
    (await payload.create({
      collection: 'authors',
      data: { name: 'Uber Conta', slug: 'uber', tenant: tenant.id } as never,
      depth: 0,
    }))

  const contentField = payload.collections.posts.config.flattenedFields.find(
    (field) => field.name === 'content',
  ) as RichTextField
  const editorConfig = await editorConfigFactory.fromField({ field: contentField })

  for (const post of blog.posts) {
    const html = attachMediaToImages(
      post.html.replace(/^<div class="raw-html-embed">/, '').replace(/<\/div>\s*$/, ''),
      mediaCache,
    )
    const content = numericUploadIDs(convertHTMLToLexical({ editorConfig, html, JSDOM }))
    const lost = describeLoss(countHtml(html), countLexical(content as never))
    if (lost.length) console.warn(`Conteúdo perdido em "${post.slug}":`, lost)

    const image = post.image ? mediaCache.get(post.image) : undefined
    const data = {
      title: post.title,
      slug: post.slug,
      category: categoryIds.get(post.categories[0])!,
      authors: [author.id],
      publishedAt: post.publishedAt,
      content,
      ...(image ? { heroImage: image } : {}),
      meta: {
        title: post.title,
        description: post.description || undefined,
        ...(image ? { image } : {}),
      },
      tenant: tenant.id,
      _status: 'published' as const,
    }
    const { docs } = await payload.find({
      collection: 'posts',
      where: where(post.slug),
      depth: 0,
      limit: 1,
      draft: true,
    })
    if (docs[0])
      await payload.update({ collection: 'posts', id: docs[0].id, data: data as never, depth: 0 })
    else await payload.create({ collection: 'posts', data: data as never, depth: 0 })
    console.log(`Post ${post.slug}`)
  }

  await upsertPage('blog', {
    title: blog.title,
    slug: 'blog',
    hero: {
      type: 'cover',
      size: 'half',
      richText: heroRichText(blog.hero.tagline, blog.hero.title, blog.hero.text),
      links: [],
      media: mediaCache.get(blog.hero.image)!,
      mediaMobile: blog.hero.imageMobile ? mediaCache.get(blog.hero.imageMobile) : undefined,
    },
    layout: [],
    meta: { title: blog.title, description: blog.metaDescription ?? undefined },
    _status: 'published',
  })
}

/** Everything of the Uber Conta property that comes from the current site. */
export async function seedUberContent(payload: Payload) {
  await seedUberPages(payload)
  await seedUberHelp(payload)
  await seedUberBlog(payload)
}
