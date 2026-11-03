import { custom } from './home'
import { cta, heroRichText, href, type Ids } from './uber-product-page'

type Hero = {
  title: string
  text?: string | null
  cta?: string | null
  ctaUrl?: string | null
  logo?: string | null
  tone?: 'onDark' | 'onLight'
  image: string
  imageMobile?: string | null
}

const buildHero = (hero: Hero, ids: Ids) => ({
  type: 'cover' as const,
  tone: hero.tone ?? 'onDark',
  richText: heroRichText(null, hero.title, hero.text),
  links: hero.cta
    ? [{ link: { ...custom(hero.cta, href(hero.ctaUrl ?? '#')), appearance: 'default' as const } }]
    : [],
  media: ids.media(hero.image),
  mediaMobile: hero.imageMobile ? ids.media(hero.imageMobile) : undefined,
  logo: hero.logo ? ids.media(hero.logo) : undefined,
})

/** "Sobre": hero, partnership video, story, timeline, Digio card and contacts. */
export type AboutPage = {
  slug: string
  title: string
  metaDescription?: string | null
  hero: Hero
  partner: {
    heading: string
    text?: string | null
    button?: string | null
    buttonUrl?: string | null
    video?: string | null
    videoMobile?: string | null
  }
  story: {
    heading: string
    text?: string | null
    image: string
    imageMobile?: string | null
    items: { icon?: string | null; title: string; text?: string | null }[]
  }
  timeline: {
    heading: string
    text?: string | null
    items: { icon?: string | null; period: string; title: string; text?: string | null }[]
  }
  imageContent: {
    heading: string
    text?: string | null
    logo?: string | null
    button?: string | null
    buttonUrl?: string | null
    newTab?: boolean
    image: string
    imageMobile?: string | null
  }
  contacts: {
    eyebrow?: string | null
    heading: string
    text?: string | null
    button?: string | null
    buttonUrl?: string | null
    groups: {
      title?: string | null
      entries: {
        title: string
        description?: string | null
        phone?: string | null
        url?: string | null
        icon?: string | null
      }[]
    }[]
  }
}

export const buildAboutPage = (page: AboutPage, ids: Ids) => {
  const { partner, story, timeline, imageContent, contacts } = page
  return {
    title: page.title,
    slug: page.slug,
    hero: buildHero(page.hero, ids),
    layout: [
      {
        blockType: 'partner',
        anchor: 'parceria',
        heading: partner.heading,
        text: partner.text ?? undefined,
        ...cta(partner.button, partner.buttonUrl),
        video: partner.video ? ids.media(partner.video) : undefined,
        videoMobile: partner.videoMobile ? ids.media(partner.videoMobile) : undefined,
      },
      {
        blockType: 'story',
        anchor: 'historia',
        heading: story.heading,
        text: story.text ?? undefined,
        image: ids.media(story.image),
        imageMobile: story.imageMobile ? ids.media(story.imageMobile) : undefined,
        items: story.items.map((item) => ({
          icon: item.icon ? ids.media(item.icon) : undefined,
          title: item.title,
          text: item.text ?? undefined,
        })),
      },
      {
        blockType: 'timeline',
        anchor: 'trajetoria',
        heading: timeline.heading,
        text: timeline.text ?? undefined,
        items: timeline.items.map((item) => ({
          icon: item.icon ? ids.media(item.icon) : undefined,
          period: item.period,
          title: item.title,
          text: item.text ?? undefined,
        })),
      },
      {
        blockType: 'imageContent',
        variant: 'card',
        heading: imageContent.heading,
        text: imageContent.text ?? undefined,
        logo: imageContent.logo ? ids.media(imageContent.logo) : undefined,
        image: ids.media(imageContent.image),
        imageMobile: imageContent.imageMobile ? ids.media(imageContent.imageMobile) : undefined,
        ...(imageContent.button && imageContent.buttonUrl
          ? {
              enableLink: true,
              link: {
                ...custom(imageContent.button, href(imageContent.buttonUrl)),
                newTab: imageContent.newTab ?? false,
              },
            }
          : {}),
      },
      contactsBlock(contacts, ids),
    ],
    meta: { title: page.title, description: page.metaDescription ?? undefined },
    _status: 'published' as const,
  }
}

export const contactsBlock = (contacts: AboutPage['contacts'], ids: Ids) => ({
  blockType: 'contacts' as const,
  anchor: 'contato',
  eyebrow: contacts.eyebrow ?? undefined,
  heading: contacts.heading,
  text: contacts.text ?? undefined,
  ...cta(contacts.button, contacts.buttonUrl),
  groups: contacts.groups.map((group) => ({
    title: group.title ?? undefined,
    entries: group.entries.map((entry) => ({
      title: entry.title,
      description: entry.description ?? undefined,
      phone: entry.phone ?? undefined,
      icon: entry.icon ? ids.media(entry.icon) : undefined,
      ...(entry.url
        ? { enableLink: true, link: { ...custom(entry.title, entry.url), newTab: true } }
        : {}),
    })),
  })),
})

/** "Informações financeiras": hero and the list of documents (PDFs are uploaded to the media library). */
export type DocumentsPage = {
  slug: string
  title: string
  metaDescription?: string | null
  hero: Hero
  groups: {
    title: string
    items: {
      title: string
      icon?: string | null
      links: { label: string; file?: string | null; url?: string | null }[]
    }[]
  }[]
}

export const buildDocumentsPage = (page: DocumentsPage, ids: Ids) => ({
  title: page.title,
  slug: page.slug,
  hero: buildHero(page.hero, ids),
  layout: [
    {
      blockType: 'documents' as const,
      anchor: 'documentos',
      groups: page.groups.map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
          title: item.title,
          icon: item.icon ? ids.media(item.icon) : undefined,
          links: item.links.map((l) => ({
            link: { ...custom(l.label, l.file ? ids.url(l.file) : (l.url ?? '#')), newTab: true },
          })),
        })),
      })),
    },
  ],
  meta: { title: page.title, description: page.metaDescription ?? undefined },
  _status: 'published' as const,
})

/** Help center home: half-height hero with the search box, then (after the categories) the app card and contacts. */
export type HelpData = {
  title: string
  metaDescription?: string | null
  hero: {
    tagline?: string | null
    title: string
    text?: string | null
    image: string
    imageMobile?: string | null
  }
  searchPlaceholder?: string | null
  imageContent: AboutPage['imageContent'] & { eyebrow?: string | null }
  contacts: AboutPage['contacts']
}

export const helpHero = (data: HelpData, ids: Ids) => ({
  type: 'cover' as const,
  size: 'half' as const,
  richText: heroRichText(data.hero.tagline, data.hero.title, data.hero.text),
  links: [],
  media: ids.media(data.hero.image),
  mediaMobile: data.hero.imageMobile ? ids.media(data.hero.imageMobile) : undefined,
  searchPlaceholder: data.searchPlaceholder ?? undefined,
})

export const buildHelpPage = (data: HelpData, ids: Ids) => {
  const { imageContent, contacts } = data
  return {
    title: data.title,
    slug: 'central-de-ajuda',
    hero: helpHero(data, ids),
    layout: [
      {
        blockType: 'imageContent' as const,
        variant: 'card' as const,
        eyebrow: imageContent.eyebrow ?? undefined,
        heading: imageContent.heading,
        text: imageContent.text ?? undefined,
        image: ids.media(imageContent.image),
        imageMobile: imageContent.imageMobile ? ids.media(imageContent.imageMobile) : undefined,
        ...(imageContent.button && imageContent.buttonUrl
          ? {
              enableLink: true,
              link: {
                ...custom(imageContent.button, imageContent.buttonUrl),
                newTab: imageContent.newTab ?? false,
              },
            }
          : {}),
      },
      contactsBlock(contacts, ids),
    ],
    meta: { title: data.title, description: data.metaDescription ?? undefined },
    _status: 'published' as const,
  }
}
