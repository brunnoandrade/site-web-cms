import { JSDOM } from 'jsdom'

/**
 * Detects content lost in the HTML -> Lexical conversion. The converter silently drops what
 * the editor does not support (lists, images...), so each migrated post is checked by counting
 * the main structures before and after.
 */

export type ContentCounts = {
  /** List items: Word pastes one <ul> per item and Lexical merges adjacent lists, so items are what must match. */
  listItems: number
  images: number
  tables: number
  headings: number
  links: number
}

export const countHtml = (html: string): ContentCounts => {
  const { document } = new JSDOM(`<!doctype html><body>${html}</body>`).window
  const count = (selector: string) => document.body.querySelectorAll(selector).length
  return {
    listItems: count('li'),
    images: count('img'),
    tables: count('table'),
    headings: count('h1, h2, h3, h4, h5, h6'),
    links: count('a[href]'),
  }
}

type LexicalNode = { type?: string; children?: LexicalNode[] }

export const countLexical = (state: { root: LexicalNode }): ContentCounts => {
  const counts: ContentCounts = { listItems: 0, images: 0, tables: 0, headings: 0, links: 0 }
  const visit = (node: LexicalNode) => {
    // A nested list adds a wrapper item in Lexical: more items than in HTML is fine.
    if (node.type === 'listitem') counts.listItems++
    if (node.type === 'upload') counts.images++
    if (node.type === 'table') counts.tables++
    if (node.type === 'heading') counts.headings++
    if (node.type === 'link' || node.type === 'autolink') counts.links++
    for (const child of node.children ?? []) visit(child)
  }
  visit(state.root)
  return counts
}

const labels: Record<keyof ContentCounts, string> = {
  listItems: 'itens de lista',
  images: 'imagens',
  tables: 'tabelas',
  headings: 'títulos',
  links: 'links',
}

/** "2 de 3 listas, 0 de 1 imagens" for each structure with fewer items after conversion. */
export const describeLoss = (before: ContentCounts, after: ContentCounts): string[] =>
  (Object.keys(labels) as (keyof ContentCounts)[])
    .filter((key) => after[key] < before[key])
    .map((key) => `${after[key]} de ${before[key]} ${labels[key]}`)

/**
 * The HTML converter stores upload IDs as strings ("12"); Postgres IDs are numbers and the
 * field validation rejects the string.
 */
export const numericUploadIDs = <T extends { root: LexicalNode }>(state: T): T => {
  const visit = (node: LexicalNode & { value?: unknown }) => {
    if (node.type === 'upload' && typeof node.value === 'string' && /^\d+$/.test(node.value)) {
      node.value = Number(node.value)
    }
    for (const child of node.children ?? []) visit(child)
  }
  visit(state.root)
  return state
}
