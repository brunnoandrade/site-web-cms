import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { createLocalReq, type Payload, type RichTextField } from 'payload'
import { normalizePath, postPath } from '@digio/routes'

import type { Author, Category, Post, Tenant } from '@digio/payload-types'

import { applyUrlChange } from '../collections/Redirects/hooks'
import { countHtml, countLexical, describeLoss, numericUploadIDs } from './contentCheck'
import { attachMediaToImages, cleanWordPressHtml } from './html'
import { fetchPublicImage } from './safeFetch'
import { decodeEntities, parseSeoHead, type SeoHead } from './seo'

/**
 * WordPress -> Payload blog migration (scripts/migrate-wordpress.ts).
 *
 * Reads the public REST API (/wp-json/wp/v2/posts with embedded author and category) and the
 * published page of each post (SEO head), then writes through the Local API. Idempotent:
 * categories, authors and posts are matched by WordPress ID, media by source URL, and posts not
 * modified in WordPress since the last run are skipped.
 */

type WpTerm = { id: number; taxonomy: string; slug: string; name: string }
type WpAuthor = { id: number; slug: string; name: string; description?: string }
export type WpPost = {
  id: number
  slug: string
  link: string
  date_gmt: string
  modified_gmt: string
  title: { rendered: string }
  excerpt?: { rendered: string }
  content: { rendered: string }
  _embedded?: { author?: WpAuthor[]; 'wp:term'?: WpTerm[][] }
}

/** WordPress authors published under another name (e.g. a service account -> "Digio"). */
export const DEFAULT_AUTHOR_OVERRIDES: Record<string, { slug: string; name: string }> = {
  'usuario-de-servico-adm-via-cofre': { slug: 'digio', name: 'Digio' },
}

export type MigrateOptions = {
  /** Blog base URL, e.g. https://www.digio.com.br/blog */
  source: string
  /** Tenant slug that receives the posts. */
  tenant: string
  limit?: number
  /** Reads and converts everything, writes nothing. */
  dryRun?: boolean
  /** Re-imports posts even when unchanged in WordPress. */
  force?: boolean
  authorOverrides?: Record<string, { slug: string; name: string }>
  fetch?: typeof fetch
  log?: (message: string) => void
}

export type MigrationReport = {
  posts: { created: number; updated: number; unchanged: number; failed: number }
  categories: number
  authors: number
  media: { imported: number; reused: number }
  videos: number
  /** WordPress URL differs from the new URL: a redirect was created. */
  urlChanges: { from: string; to: string }[]
  /** Links to WordPress files (wp-content) left in the content. */
  wpContentLinks: string[]
  /** Posts whose content lost structures in the conversion (lists, images, tables...). */
  contentLoss: { post: string; lost: string[] }[]
  errors: { post: string; message: string }[]
}

const USER_AGENT = 'digio-migracao-blog'

export async function migrateWordPress(
  payload: Payload,
  options: MigrateOptions,
): Promise<MigrationReport> {
  const { source, dryRun = false, force = false, log = () => {} } = options
  const http = options.fetch ?? fetch
  const authorOverrides = options.authorOverrides ?? DEFAULT_AUTHOR_OVERRIDES
  const base = source.replace(/\/$/, '')

  const report: MigrationReport = {
    posts: { created: 0, updated: 0, unchanged: 0, failed: 0 },
    categories: 0,
    authors: 0,
    media: { imported: 0, reused: 0 },
    videos: 0,
    urlChanges: [],
    wpContentLinks: [],
    contentLoss: [],
    errors: [],
  }

  const tenant = await findTenant(payload, options.tenant)
  const siteOrigins = [...new Set([new URL(base).origin, new URL(tenant.siteUrl).origin])]
  const context = { disableRevalidate: true }
  const req = await createLocalReq({ context }, payload)

  // ---- HTTP -----------------------------------------------------------------------------
  const get = async (url: string, attempts = 3): Promise<Response> => {
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await http(url, {
          headers: { 'User-Agent': USER_AGENT },
          signal: AbortSignal.timeout(30_000),
        })
        if (res.status >= 500 && attempt < attempts) continue
        return res
      } catch (err) {
        if (attempt >= attempts) throw err
      }
    }
  }

  // ---- Categories and authors (from the embedded data of each post) -------------------------
  const categories = new Map<number, Category>()
  const upsertCategory = async (term: WpTerm): Promise<Category> => {
    const cached = categories.get(term.id)
    if (cached) return cached

    const data = {
      title: decodeEntities(term.name),
      slug: term.slug,
      wpId: term.id,
      tenant: tenant.id,
    }
    const existing =
      (await findOne<Category>(payload, 'categories', tenant.id, { wpId: { equals: term.id } })) ??
      (await findOne<Category>(payload, 'categories', tenant.id, { slug: { equals: term.slug } }))

    const doc = dryRun
      ? (existing ?? ({ id: -term.id, ...data } as Category))
      : existing
        ? await payload.update({ collection: 'categories', id: existing.id, data, context })
        : await payload.create({ collection: 'categories', data, context })

    if (!existing) report.categories++
    categories.set(term.id, doc)
    return doc
  }

  const authors = new Map<string, Author>()
  const upsertAuthor = async (wpAuthor: WpAuthor): Promise<Author> => {
    const override = authorOverrides[wpAuthor.slug]
    const slug = override?.slug ?? wpAuthor.slug
    const cached = authors.get(slug)
    if (cached) return cached

    const data = {
      name: override?.name ?? decodeEntities(wpAuthor.name),
      slug,
      ...(override ? {} : { wpId: wpAuthor.id, bio: wpAuthor.description || undefined }),
      tenant: tenant.id,
    }
    const existing = await findOne<Author>(payload, 'authors', tenant.id, {
      slug: { equals: slug },
    })

    const doc = dryRun
      ? (existing ?? ({ id: -wpAuthor.id, ...data } as Author))
      : (existing ?? (await payload.create({ collection: 'authors', data, context })))

    if (!existing) report.authors++
    authors.set(slug, doc)
    return doc
  }

  // ---- Media (reused by source URL) ---------------------------------------------------------
  const importMedia = async (url: string, alt: string): Promise<number | null> => {
    const existing = await findOne<{ id: number }>(payload, 'media', tenant.id, {
      wpSourceUrl: { equals: url },
    })
    if (existing) {
      report.media.reused++
      return existing.id
    }
    if (dryRun) {
      report.media.imported++
      return null
    }

    // The URL comes from the post content: never fetch internal addresses (see safeFetch.ts).
    const { data, contentType } = await fetchPublicImage(url, {
      trustedOrigins: siteOrigins,
      fetch: http,
      headers: { 'User-Agent': USER_AGENT },
    })
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'imagem')

    const media = await payload.create({
      collection: 'media',
      context,
      data: { alt, tenant: tenant.id, wpSourceUrl: url },
      file: {
        data,
        name,
        mimetype: contentType ?? 'application/octet-stream',
        size: data.byteLength,
      },
    })
    report.media.imported++
    return media.id
  }

  // ---- Lexical converter with the posts content editor -------------------------------------
  const contentField = payload.collections.posts.config.flattenedFields.find(
    (field) => field.name === 'content',
  ) as RichTextField
  const editorConfig = editorConfigFactory.fromField({ field: contentField })

  // ---- Posts ----------------------------------------------------------------------------------
  const wpPosts = await fetchPosts(get, base, options.limit, log)
  log(`${wpPosts.length} posts no WordPress`)

  for (const [index, wpPost] of wpPosts.entries()) {
    const label = `${wpPost.id} ${wpPost.slug}`
    try {
      const existing = await findOne<Post>(payload, 'posts', tenant.id, {
        wpId: { equals: wpPost.id },
      })
      const modifiedAt = `${wpPost.modified_gmt}Z`

      if (
        existing &&
        !force &&
        existing.wpModifiedAt &&
        new Date(existing.wpModifiedAt).getTime() === new Date(modifiedAt).getTime()
      ) {
        report.posts.unchanged++
        continue
      }

      const term = wpPost._embedded?.['wp:term']?.flat().find((t) => t.taxonomy === 'category')
      if (!term) throw new Error('post sem categoria')
      const category = await upsertCategory(term)

      const wpAuthor = wpPost._embedded?.author?.[0]
      const author = wpAuthor ? await upsertAuthor(wpAuthor) : null

      const title = decodeEntities(wpPost.title.rendered)
      const seo = await fetchSeo(get, wpPost.link)

      const cleaned = cleanWordPressHtml(wpPost.content.rendered, { siteOrigins })
      report.videos += cleaned.videos
      report.wpContentLinks.push(...cleaned.wpContentLinks)

      const mediaBySrc = new Map<string, number>()
      for (const src of cleaned.images) {
        const id = await importMedia(src, title)
        if (id !== null) mediaBySrc.set(src, id)
      }
      const heroImage = seo.image ? await importMedia(seo.image, title) : null

      const html = attachMediaToImages(cleaned.html, mediaBySrc)
      const content = numericUploadIDs(
        convertHTMLToLexical({ editorConfig: await editorConfig, html, JSDOM }),
      )

      // In a dry run images are not imported yet, so they are not expected in the result.
      const expected = countHtml(dryRun ? html.replace(/<img[^>]*>/g, '') : html)
      const lost = describeLoss(expected, countLexical(content as never))
      if (lost.length > 0) report.contentLoss.push({ post: label, lost })

      const data = {
        title,
        slug: wpPost.slug,
        category: category.id,
        authors: author ? [author.id] : [],
        publishedAt: `${wpPost.date_gmt}Z`,
        content,
        ...(heroImage ? { heroImage } : {}),
        meta: {
          title: seo.title ?? title,
          description: seo.description ?? undefined,
          ...(heroImage ? { image: heroImage } : {}),
        },
        wpId: wpPost.id,
        wpModifiedAt: modifiedAt,
        tenant: tenant.id,
        _status: 'published' as const,
      }

      const oldPath = normalizePath(new URL(wpPost.link).pathname)
      const newPath = postPath(category.slug, wpPost.slug)

      if (dryRun) {
        if (existing) report.posts.updated++
        else report.posts.created++
        if (oldPath !== newPath) report.urlChanges.push({ from: oldPath, to: newPath })
        continue
      }

      const saved = existing
        ? await payload.update({
            collection: 'posts',
            id: existing.id,
            data: data as never,
            context,
          })
        : await payload.create({ collection: 'posts', data: data as never, context })
      if (existing) report.posts.updated++
      else report.posts.created++

      // URLs are expected to be the same as in WordPress; if not, keep the old one working.
      if (oldPath !== newPath) {
        await applyUrlChange({
          req,
          tenant: tenant.id,
          oldPath,
          newPath,
          destination: { reference: { relationTo: 'posts', value: saved.id } },
        })
        report.urlChanges.push({ from: oldPath, to: newPath })
      }

      if ((index + 1) % 25 === 0) log(`${index + 1}/${wpPosts.length} posts processados`)
    } catch (err) {
      report.posts.failed++
      report.errors.push({ post: label, message: (err as Error).message })
    }
  }

  report.wpContentLinks = [...new Set(report.wpContentLinks)]
  return report
}

// ---- helpers ------------------------------------------------------------------------------

async function findTenant(payload: Payload, slug: string): Promise<Tenant> {
  const { docs } = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  if (!docs[0]) throw new Error(`Propriedade "${slug}" não existe.`)
  return docs[0]
}

async function findOne<T>(
  payload: Payload,
  collection: 'categories' | 'authors' | 'media' | 'posts',
  tenant: number,
  where: Record<string, unknown>,
): Promise<T | null> {
  const { docs } = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    draft: collection === 'posts' ? true : undefined,
    where: { and: [{ tenant: { equals: tenant } }, where] } as never,
  })
  return (docs[0] as T | undefined) ?? null
}

async function fetchPosts(
  get: (url: string) => Promise<Response>,
  base: string,
  limit: number | undefined,
  log: (message: string) => void,
): Promise<WpPost[]> {
  const posts: WpPost[] = []
  for (let page = 1; ; page++) {
    const perPage = Math.min(100, limit ? limit - posts.length : 100)
    const url = `${base}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&orderby=date&order=asc&_embed=author,wp:term`
    const res = await get(url)
    const body = (await res.json()) as unknown
    if (!res.ok || !Array.isArray(body)) {
      throw new Error(
        `WordPress respondeu ${res.status} em ${url}: ${JSON.stringify(body).slice(0, 200)}`,
      )
    }
    posts.push(...(body as WpPost[]))
    const totalPages = Number(res.headers.get('x-wp-totalpages') ?? page)
    log(`página ${page}/${totalPages} lida`)
    if (page >= totalPages || (limit && posts.length >= limit)) break
  }
  return limit ? posts.slice(0, limit) : posts
}

async function fetchSeo(get: (url: string) => Promise<Response>, link: string): Promise<SeoHead> {
  const res = await get(link)
  if (!res.ok) return { title: null, description: null, image: null, canonical: null }
  const html = await res.text()
  // Only the head matters; avoids parsing the whole page.
  return parseSeoHead(html.slice(0, html.indexOf('</head>') + 7 || undefined))
}
