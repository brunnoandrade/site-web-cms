import { custom } from './home'

/**
 * A product page of the Uber Conta property, as extracted from the current site by
 * scripts/uber-pages/extract.py (scripts/uber-pages/data/<slug>.json). File names are files in
 * seed/uber-conta-assets/. Texts and images are the current site's; adjust them in the admin.
 */
export type ProductPage = {
  slug: string
  title: string
  metaDescription?: string | null
  hero: {
    tagline?: string | null
    title: string
    text?: string | null
    legend?: string | null
    legendLink?: { label: string; url: string } | null
    cta?: string | null
    ctaUrl?: string | null
    image: string
    imageMobile?: string | null
  }
  features?: {
    heading: string
    description?: string | null
    button?: string | null
    buttonUrl?: string | null
    image?: string | null
    video?: string | null
    items: { icon?: string | null; title: string; text?: string | null }[]
  }
  steps?: {
    heading: string
    text?: string | null
    button?: string | null
    buttonUrl?: string | null
    items: {
      title: string
      text?: string | null
      image?: string | null
      imageMobile?: string | null
    }[]
  }
  /** Optional highlight between the steps and the blog (only "Crédito Pessoal" has it). */
  increase?: {
    icon?: string | null
    heading: string
    text?: string | null
    legend?: string | null
    button?: string | null
    buttonUrl?: string | null
    image: string
    imageMobile?: string | null
    items: { icon?: string | null; text: string }[]
  }
  posts?: {
    eyebrow?: string | null
    heading: string
    button?: string | null
    buttonUrl?: string | null
  }
  band?: { image: string; imageMobile?: string | null; style?: string | null }
  /** Answers are HTML snippets (<p>, <ol>, <ul>, <li>, <strong>, <a>) as in the current site. */
  faqs?: { question: string; answer: string; slug?: string | null; category?: string | null }[]
  faqSection?: { heading: string; button?: string | null; buttonUrl?: string | null }
  related?: {
    heading: string
    text?: string | null
    legend?: string | null
    button?: string | null
    buttonUrl?: string | null
    image?: string | null
    imageMobile?: string | null
    items: { title: string; text?: string | null; icon?: string | null; url: string }[]
  }
}

const text = (value: string, format = 0) => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})
const node = (type: string, children: unknown[], extra: object = {}) => ({
  type,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children,
  ...extra,
})

const decode = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

/** Inline HTML (<strong>, <b>, <a>, <br>) to Lexical text and link nodes. */
const inline = (html: string): unknown[] => {
  const out: unknown[] = []
  let bold = false
  let href: string | null = null
  let buffer: unknown[] | null = null
  const push = (n: unknown) => (buffer ?? out).push(n)
  for (const part of html.split(/(<[^>]+>)/g)) {
    if (!part) continue
    if (part.startsWith('<')) {
      const tag = (/^<\/?\s*([a-z0-9]+)/i.exec(part)?.[1] ?? '')
        .toLowerCase()
        .replace(/[<>/\s].*$/s, '')
        .replace('<', '')
        .toLowerCase()
      const closing = part.startsWith('</')
      if (tag === 'strong' || tag === 'b') bold = !closing
      else if (tag === 'a') {
        if (closing) {
          if (href && buffer) {
            out.push({
              type: 'link',
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 3,
              fields: { linkType: 'custom', url: href, newTab: false },
              children: buffer,
            })
          }
          href = null
          buffer = null
        } else {
          href = /href="([^"]*)"/.exec(part)?.[1] ?? null
          buffer = []
        }
      } else if (tag === 'br') push({ type: 'linebreak', version: 1 })
      continue
    }
    const value = decode(part).replace(/\s+/g, ' ')
    if (value.trim() || value === ' ') push(text(value, bold ? 1 : 0))
  }
  return out.length ? out : [text('')]
}

/** Converts the simple HTML of an answer (paragraphs and lists) to Lexical state. */
export const htmlToLexical = (html: string) => {
  const children: unknown[] = []
  for (const match of html.matchAll(/<(p|ol|ul)[^>]*>([\s\S]*?)<\/\1>/g)) {
    const [, tag, inner] = match
    if (tag === 'p') {
      if (inner.replace(/<[^>]+>|&nbsp;|\s/g, '')) {
        children.push(node('paragraph', inline(inner.trim()), { textFormat: 0 }))
      }
    } else {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li, i) =>
        node('listitem', inline(li[1].trim()), { value: i + 1 }),
      )
      children.push(
        node('list', items, { listType: tag === 'ol' ? 'number' : 'bullet', start: 1, tag }),
      )
    }
  }
  if (children.length === 0)
    children.push(node('paragraph', [text(decode(html.replace(/<[^>]+>/g, '')))]))
  return { root: node('root', children) } as never
}

/** Title with `\n` becomes a heading with line breaks. */
const titleNodes = (title: string) =>
  title
    .split('\n')
    .flatMap((line, i) =>
      i ? [{ type: 'linebreak', version: 1 }, text(line.trim())] : [text(line.trim())],
    )

/** Heading with `\n` line breaks. */
export const richHeading = (tag: 'h1' | 'h2', value: string) =>
  ({ root: node('root', [node('heading', titleNodes(value), { tag })]) }) as never

export const heroRichText = (
  tagline: string | null | undefined,
  title: string,
  body?: string | null,
) =>
  ({
    root: node('root', [
      ...(tagline ? [node('heading', [text(tagline)], { tag: 'h6' })] : []),
      node('heading', titleNodes(title), { tag: 'h1' }),
      ...(body ? [node('paragraph', [text(body)], { textFormat: 0 })] : []),
    ]),
  }) as never

/** Internal paths get a trailing slash (the site uses `trailingSlash`); anchors and URLs stay. */
export const href = (url: string) => {
  if (/^(https?:|mailto:|tel:|#)/.test(url)) return url
  const [path, query] = url.split('?')
  return (path.endsWith('/') ? path : `${path}/`) + (query ? `?${query}` : '')
}

export type Ids = {
  media: (file: string) => number
  /** Public URL of an uploaded file (for links to PDFs). */
  url: (file: string) => string
  faq: (question: string) => number
}

export const cta = (label: string | null | undefined, url: string | null | undefined) =>
  label && url ? { enableLink: true as const, link: custom(label, href(url)) } : {}

/** Page data (hero and layout) of a product page, in the order of the current site. */
export const buildProductPage = (page: ProductPage, ids: Ids) => {
  const { features, steps, increase, posts, band, faqs, faqSection, related } = page
  const layout: unknown[] = []

  if (features) {
    layout.push({
      blockType: 'cards',
      variant: 'benefits',
      theme: 'lilac',
      anchor: 'caracteristicas',
      heading: features.heading,
      intro: features.description ?? undefined,
      image: features.image ? ids.media(features.image) : undefined,
      video: features.video ? ids.media(features.video) : undefined,
      enableSectionLink: Boolean(features.button && features.buttonUrl),
      sectionLink:
        features.button && features.buttonUrl
          ? custom(features.button, href(features.buttonUrl))
          : undefined,
      items: features.items.map((item) => ({
        title: item.title,
        text: item.text ?? undefined,
        image: item.icon ? ids.media(item.icon) : undefined,
      })),
    })
  }

  if (steps) {
    layout.push({
      blockType: 'steps',
      theme: 'navy',
      anchor: 'contratar',
      heading: steps.heading,
      intro: steps.text ?? undefined,
      ...cta(steps.button, steps.buttonUrl),
      items: steps.items.map((item) => ({
        title: item.title,
        text: item.text ?? undefined,
        image: item.image ? ids.media(item.image) : undefined,
        imageMobile: item.imageMobile ? ids.media(item.imageMobile) : undefined,
      })),
    })
  }

  if (increase) {
    layout.push({
      blockType: 'imageContent',
      variant: 'section',
      theme: 'navy',
      anchor: 'aumente',
      image: ids.media(increase.image),
      imageMobile: increase.imageMobile ? ids.media(increase.imageMobile) : undefined,
      logo: increase.icon ? ids.media(increase.icon) : undefined,
      heading: increase.heading,
      text: increase.text ?? undefined,
      legend: increase.legend ?? undefined,
      ...cta(increase.button, increase.buttonUrl),
      items: increase.items.map((item) => ({
        icon: item.icon ? ids.media(item.icon) : undefined,
        text: item.text,
      })),
    })
  }

  if (posts) {
    layout.push({
      blockType: 'archive',
      anchor: 'blog',
      populateBy: 'collection',
      relationTo: 'posts',
      // The latest posts of the blog (3, like the current site); the home still reads Medium.
      limit: 3,
      variant: 'carousel',
      eyebrow: posts.eyebrow ?? undefined,
      introContent: richHeading('h2', posts.heading),
      enableMoreLink: Boolean(posts.button && posts.buttonUrl),
      moreLink:
        posts.button && posts.buttonUrl
          ? { ...custom(posts.button, posts.buttonUrl), newTab: true }
          : undefined,
    })
  }

  if (band) {
    layout.push({
      blockType: 'mediaBlock',
      media: ids.media(band.image),
      mediaMobile: band.imageMobile ? ids.media(band.imageMobile) : undefined,
      background: band.style === 'light' ? 'grey' : 'white',
    })
  }

  if (faqs?.length) {
    layout.push({
      blockType: 'faq',
      variant: 'cards',
      theme: 'light',
      anchor: 'ajuda',
      heading: faqSection?.heading ?? 'Ficou com alguma dúvida?',
      faqs: faqs.map((faq) => ids.faq(faq.question)),
      enableMoreLink: true,
      moreLink: custom(
        faqSection?.button ?? 'Outras dúvidas',
        href(faqSection?.buttonUrl ?? '/central-de-ajuda'),
      ),
    })
  }

  if (related) {
    layout.push({
      blockType: 'cards',
      variant: 'icon',
      theme: 'navy',
      anchor: 'relacionadas',
      heading: related.heading,
      intro: related.text ?? undefined,
      legend: related.legend ?? undefined,
      backgroundImage: related.image ? ids.media(related.image) : undefined,
      backgroundImageMobile: related.imageMobile ? ids.media(related.imageMobile) : undefined,
      listHeading: 'Mais soluções pra você',
      enableSectionLink: Boolean(related.button && related.buttonUrl),
      sectionLink:
        related.button && related.buttonUrl
          ? custom(related.button, href(related.buttonUrl))
          : undefined,
      columns: '4',
      items: related.items.map((item) => ({
        title: item.title,
        text: item.text ?? undefined,
        image: item.icon ? ids.media(item.icon) : undefined,
        enableLink: true,
        link: custom(item.title, href(item.url)),
      })),
    })
  }

  return {
    title: page.title,
    slug: page.slug,
    hero: {
      type: 'cover' as const,
      richText: heroRichText(page.hero.tagline, page.hero.title, page.hero.text),
      links: page.hero.cta
        ? [
            {
              link: {
                ...custom(page.hero.cta, href(page.hero.ctaUrl ?? '#caracteristicas')),
                appearance: 'default' as const,
              },
            },
          ]
        : [],
      media: ids.media(page.hero.image),
      mediaMobile: page.hero.imageMobile ? ids.media(page.hero.imageMobile) : undefined,
      disclaimer: page.hero.legend ?? undefined,
      disclaimerLink: page.hero.legendLink
        ? custom(page.hero.legendLink.label, href(page.hero.legendLink.url))
        : undefined,
    },
    layout,
    meta: { title: page.title, description: page.metaDescription ?? undefined },
    _status: 'published' as const,
  }
}
