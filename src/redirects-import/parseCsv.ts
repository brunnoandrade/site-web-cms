import { parse } from 'csv-parse/sync'

/**
 * Redirect CSV (UTF-8, comma or semicolon separated, header in the first line):
 *
 *   from,to,type,wave,active,tenant
 *   /cartao-antigo/,/cartao/,301,3,true,digio
 *
 * - from, to: required. Paths or full URLs; `to` may be external.
 * - type: 301 (default) or 302.
 * - wave: 1-4 (docs/virada.md), optional.
 * - active: true (default) or false. Also accepts sim/não, 1/0.
 * - tenant: tenant slug; optional when given on the command line.
 * Header names in Portuguese are accepted too: origem, destino, tipo, onda, ativo, propriedade.
 */

export type RedirectRow = {
  line: number
  from: string
  to: string
  type: '301' | '302'
  wave?: '1' | '2' | '3' | '4'
  active: boolean
  tenant?: string
}

export type RowError = { line: number; message: string }

const aliases: Record<string, keyof Omit<RedirectRow, 'line'>> = {
  from: 'from',
  origem: 'from',
  to: 'to',
  destino: 'to',
  type: 'type',
  tipo: 'type',
  status: 'type',
  wave: 'wave',
  onda: 'wave',
  active: 'active',
  ativo: 'active',
  tenant: 'tenant',
  propriedade: 'tenant',
}

const truthy = new Set(['true', '1', 'sim', 's', 'yes', 'y'])
const falsy = new Set(['false', '0', 'não', 'nao', 'n', 'no'])

export function parseRedirectCsv(content: string): { rows: RedirectRow[]; errors: RowError[] } {
  const firstLine = content.split(/\r?\n/, 1)[0] ?? ''
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','

  const records = parse(content, {
    bom: true,
    delimiter,
    columns: (header: string[]) =>
      header.map((name) => aliases[name.trim().toLowerCase()] ?? name.trim()),
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    info: true,
  }) as { record: Record<string, string>; info: { lines: number } }[]

  const rows: RedirectRow[] = []
  const errors: RowError[] = []

  for (const { record, info } of records) {
    const line = info.lines
    const fail = (message: string) => errors.push({ line, message })

    if (!record.from) {
      fail('Coluna "from" vazia.')
      continue
    }
    if (!record.to) {
      fail('Coluna "to" vazia.')
      continue
    }

    const type = (record.type || '301').replace(/\D/g, '')
    if (type !== '301' && type !== '302') {
      fail(`Tipo "${record.type}" inválido: use 301 ou 302.`)
      continue
    }

    const wave = record.wave?.trim()
    if (wave && !['1', '2', '3', '4'].includes(wave)) {
      fail(`Onda "${wave}" inválida: use 1, 2, 3 ou 4.`)
      continue
    }

    const activeRaw = (record.active ?? '').trim().toLowerCase()
    if (activeRaw && !truthy.has(activeRaw) && !falsy.has(activeRaw)) {
      fail(`Valor "${record.active}" inválido na coluna "active".`)
      continue
    }

    rows.push({
      line,
      from: record.from,
      to: record.to,
      type,
      ...(wave ? { wave: wave as RedirectRow['wave'] } : {}),
      active: activeRaw ? truthy.has(activeRaw) : true,
      ...(record.tenant ? { tenant: record.tenant } : {}),
    })
  }

  return { rows, errors }
}
