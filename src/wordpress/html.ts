import { JSDOM } from 'jsdom'

export type CleanOptions = {
  /** Origins of the site itself: links to them become relative (https://www.digio.com.br). */
  siteOrigins: string[]
}

export type CleanResult = {
  html: string
  /** Image URLs found in the content, to be imported as media. */
  images: string[]
  /** Video iframes turned into links. */
  videos: number
  /** Links still pointing to WordPress files (wp-content), to review before WordPress goes away. */
  wpContentLinks: string[]
}

const youtubeWatchURL = (src: string): string | null => {
  const match = /youtube(?:-nocookie)?\.com\/embed\/([\w-]{6,})/.exec(src)
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : null
}

/**
 * Prepares WordPress post HTML for the Lexical converter:
 * - unwraps the formatting noise pasted from Word (spans such as NormalTextRun, TextRun);
 * - drops class/style/id attributes;
 * - turns links to the site itself into relative paths (the URLs are the same on the new site);
 * - replaces video iframes with a link (there is no embed block yet);
 * - lists the images to import.
 */
export function cleanWordPressHtml(html: string, { siteOrigins }: CleanOptions): CleanResult {
  const { document } = new JSDOM(`<!doctype html><body>${html}</body>`).window
  const body = document.body
  const origins = siteOrigins.map((origin) => origin.replace(/\/$/, '').toLowerCase())

  // Word/Office noise: <span class="TextRun">text</span> -> text
  for (const span of [...body.querySelectorAll('span')]) span.replaceWith(...span.childNodes)

  let videos = 0
  for (const iframe of [...body.querySelectorAll('iframe')]) {
    const src = iframe.getAttribute('src') ?? ''
    const href = youtubeWatchURL(src) ?? src
    const paragraph = document.createElement('p')
    if (href) {
      const link = document.createElement('a')
      link.href = href
      link.textContent = iframe.getAttribute('title') || 'Assista ao vídeo'
      paragraph.append(link)
      videos++
    }
    iframe.replaceWith(paragraph)
  }

  // Images must be blocks for Lexical (inside a paragraph or a link they would be dropped):
  // unwrap image links (they point to the image file itself) and lift each image out of its
  // paragraph, keeping the text before and after it in place.
  for (const img of [...body.querySelectorAll('img')]) {
    const link = img.parentElement
    if (link?.tagName === 'A' && !link.textContent?.trim()) link.replaceWith(img)

    let block: Element | null = img.parentElement
    while (block && block !== body && block.parentElement !== body) block = block.parentElement
    if (!block || block === body) continue

    const after = block.cloneNode(false) as Element
    let sibling = img.nextSibling
    // Moves everything after the image (in the same block) into a new block.
    if (img.parentElement === block) {
      while (sibling) {
        const next = sibling.nextSibling
        after.append(sibling)
        sibling = next
      }
    }
    block.after(img)
    if (after.textContent?.trim()) img.after(after)
    if (!block.textContent?.trim() && !block.querySelector('img')) block.remove()
  }

  for (const element of [...body.querySelectorAll('*')]) {
    for (const attribute of [
      'class',
      'style',
      'id',
      'data-contrast',
      'data-ccp-props',
      'lang',
      'xml:lang',
    ]) {
      element.removeAttribute(attribute)
    }
  }

  const wpContentLinks: string[] = []
  for (const link of [...body.querySelectorAll('a[href]')]) {
    const href = link.getAttribute('href')!.trim()
    let url: URL
    try {
      url = new URL(href)
    } catch {
      continue
    }
    if (url.pathname.includes('/wp-content/')) wpContentLinks.push(href)
    if (origins.includes(url.origin.toLowerCase())) {
      link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`)
    }
  }

  const images = [...body.querySelectorAll('img[src]')].map((img) => img.getAttribute('src')!)

  return { html: body.innerHTML, images: [...new Set(images)], videos, wpContentLinks }
}

/** Points <img> tags at imported media, so the Lexical converter creates upload nodes. */
export function attachMediaToImages(html: string, mediaIDBySrc: Map<string, number>): string {
  const { document } = new JSDOM(`<!doctype html><body>${html}</body>`).window
  for (const img of [...document.body.querySelectorAll('img[src]')]) {
    const id = mediaIDBySrc.get(img.getAttribute('src')!)
    if (id === undefined) {
      img.remove()
      continue
    }
    img.setAttribute('data-lexical-upload-relation-to', 'media')
    img.setAttribute('data-lexical-upload-id', String(id))
  }
  return document.body.innerHTML
}
