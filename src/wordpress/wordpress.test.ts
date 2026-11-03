import { describe, expect, it } from 'vitest'

import { attachMediaToImages, cleanWordPressHtml } from './html'
import { decodeEntities, parseSeoHead } from './seo'

const siteOrigins = ['https://www.digio.com.br', 'https://digio.com.br']

describe('parseSeoHead', () => {
  it('reads title (without the blog suffix), description, image and canonical', () => {
    const head = `<html><head>
      <title>Bets: o que são | Blog do Digio</title>
      <meta name="description" content="Descubra o que são bets.">
      <meta property="og:title" content="Bets: o que são | Blog do Digio">
      <meta property="og:image" content="https://www.digio.com.br/blog/wp-content/uploads/2026/09/capa.png">
      <link rel="canonical" href="https://www.digio.com.br/blog/noticias/bets/">
    </head></html>`
    expect(parseSeoHead(head)).toEqual({
      title: 'Bets: o que são',
      description: 'Descubra o que são bets.',
      image: 'https://www.digio.com.br/blog/wp-content/uploads/2026/09/capa.png',
      canonical: 'https://www.digio.com.br/blog/noticias/bets/',
    })
  })

  it('returns nulls when the head has nothing', () => {
    expect(parseSeoHead('<html><head></head></html>')).toEqual({
      title: null,
      description: null,
      image: null,
      canonical: null,
    })
  })
})

describe('decodeEntities', () => {
  it('decodes WordPress titles', () => {
    expect(decodeEntities('Caf&#233; &amp; cr&eacute;dito &#8211; guia')).toBe(
      'Café & crédito – guia',
    )
  })
})

describe('cleanWordPressHtml', () => {
  it('unwraps Word spans and drops noisy attributes', () => {
    const { html } = cleanWordPressHtml(
      '<p class="x" style="color:red"><span class="TextRun"><span class="NormalTextRun">Olá</span></span> mundo</p>',
      { siteOrigins },
    )
    expect(html).toBe('<p>Olá mundo</p>')
  })

  it('makes links to the site relative and keeps external links', () => {
    const { html } = cleanWordPressHtml(
      '<p><a href="https://www.digio.com.br/blog/noticias/x/?utm=1#topo">post</a> <a href="https://www.bcb.gov.br/">BC</a></p>',
      { siteOrigins },
    )
    expect(html).toContain('href="/blog/noticias/x/?utm=1#topo"')
    expect(html).toContain('href="https://www.bcb.gov.br/"')
  })

  it('turns YouTube iframes into links', () => {
    const { html, videos } = cleanWordPressHtml(
      '<iframe title="Como usar o app" src="https://www.youtube.com/embed/abc123XYZ?feature=oembed"></iframe>',
      { siteOrigins },
    )
    expect(videos).toBe(1)
    expect(html).toBe(
      '<p><a href="https://www.youtube.com/watch?v=abc123XYZ">Como usar o app</a></p>',
    )
  })

  it('lists images and WordPress file links', () => {
    const result = cleanWordPressHtml(
      '<p><img src="https://www.digio.com.br/blog/wp-content/uploads/a.png"><img src="https://www.digio.com.br/blog/wp-content/uploads/a.png"></p><a href="https://www.digio.com.br/blog/wp-content/uploads/tabela.pdf">PDF</a>',
      { siteOrigins },
    )
    expect(result.images).toEqual(['https://www.digio.com.br/blog/wp-content/uploads/a.png'])
    expect(result.wpContentLinks).toEqual([
      'https://www.digio.com.br/blog/wp-content/uploads/tabela.pdf',
    ])
  })
})

describe('images become blocks (Lexical drops images inside paragraphs)', () => {
  it('lifts an image out of its paragraph', () => {
    expect(cleanWordPressHtml('<p><img src="a.png"></p>', { siteOrigins }).html).toBe(
      '<img src="a.png">',
    )
  })

  it('unwraps links to the image file', () => {
    const { html, wpContentLinks } = cleanWordPressHtml(
      '<p><a href="https://www.digio.com.br/blog/wp-content/uploads/a.png"><img src="https://www.digio.com.br/blog/wp-content/uploads/a.png"></a></p>',
      { siteOrigins },
    )
    expect(html).toBe('<img src="https://www.digio.com.br/blog/wp-content/uploads/a.png">')
    expect(wpContentLinks).toEqual([])
  })

  it('keeps the text before and after the image in order', () => {
    expect(cleanWordPressHtml('<p>antes <img src="a.png"> depois</p>', { siteOrigins }).html).toBe(
      '<p>antes </p><img src="a.png"><p> depois</p>',
    )
  })
})

describe('attachMediaToImages', () => {
  it('marks imported images for the Lexical converter and drops the others', () => {
    const html = attachMediaToImages(
      '<p><img src="a.png"><img src="b.png"></p>',
      new Map([['a.png', 7]]),
    )
    expect(html).toBe(
      '<p><img src="a.png" data-lexical-upload-relation-to="media" data-lexical-upload-id="7"></p>',
    )
  })
})

describe('content check', () => {
  it('reports structures lost in the conversion', async () => {
    const { countHtml, countLexical, describeLoss } = await import('./contentCheck')
    const before = countHtml('<ul><li>a</li></ul><img src="x"><h2>t</h2><a href="/x/">l</a>')
    const after = countLexical({
      root: {
        children: [{ type: 'heading' }, { type: 'paragraph', children: [{ type: 'link' }] }],
      },
    })
    expect(describeLoss(before, after)).toEqual(['0 de 1 itens de lista', '0 de 1 imagens'])
  })

  it('does not flag adjacent lists merged by Lexical (Word pastes one list per item)', async () => {
    const { countHtml, countLexical, describeLoss } = await import('./contentCheck')
    const before = countHtml('<ul><li>a</li></ul><ul><li>b</li></ul>')
    const after = countLexical({
      root: {
        children: [{ type: 'list', children: [{ type: 'listitem' }, { type: 'listitem' }] }],
      },
    })
    expect(describeLoss(before, after)).toEqual([])
  })
})

describe('numericUploadIDs', () => {
  it('turns string upload IDs into numbers', async () => {
    const { numericUploadIDs } = await import('./contentCheck')
    const state = { root: { children: [{ type: 'upload', value: '12' }, { type: 'paragraph' }] } }
    expect(numericUploadIDs(state).root.children[0]).toEqual({ type: 'upload', value: 12 })
  })
})
