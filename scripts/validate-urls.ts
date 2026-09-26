/**
 * Checks a list of old URLs against any environment: each must answer 200, or 301 to a
 * destination that answers 200 (one hop), keeping the query string.
 *
 *   pnpm validate-urls <lista.csv> [base=https://hml.exemplo.com.br] [paralelo=8] [saida=relatorio.csv]
 *
 * The list may hold full URLs (production URLs are rebased onto `base`) or paths (needs `base`).
 * Exit code 1 when any URL fails, so it can gate a cutover wave (docs/virada.md).
 */
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

import {
  checkUrl,
  readUrlList,
  rebase,
  withProbe,
  type Check,
  type Fetcher,
} from './validate-urls.lib'

const args = process.argv.slice(2)
const option = (name: string) =>
  args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1)
const file = args.find((arg) => !arg.includes('='))

if (!file) {
  console.error(
    'Uso: pnpm validate-urls <lista.csv> [base=https://ambiente] [paralelo=8] [saida=relatorio.csv]',
  )
  process.exit(1)
}

const base = option('base')
const concurrency = Math.max(1, Number(option('paralelo') ?? 8))
const output = option('saida')
const cwd = process.env.INIT_CWD ?? process.cwd()

const fetcher: Fetcher = async (url) => {
  const attempt = async () => {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'digio-validate-urls' },
      signal: AbortSignal.timeout(15_000),
    })
    await res.body?.cancel()
    return { status: res.status, location: res.headers.get('location') }
  }
  try {
    return await attempt()
  } catch {
    return attempt() // one retry on network errors
  }
}

const urls = readUrlList(await readFile(path.resolve(cwd, file), 'utf8')).map((url) => {
  if (url.startsWith('/') && !base) {
    console.error(`"${url}" é um caminho: informe base=https://...`)
    process.exit(1)
  }
  return withProbe(rebase(url, base))
})

console.log(
  `Validando ${urls.length} URLs${base ? ` em ${base}` : ''} (${concurrency} em paralelo)...\n`,
)

const results: Check[] = new Array(urls.length)
let next = 0
await Promise.all(
  Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
    while (next < urls.length) {
      const index = next++
      results[index] = await checkUrl(urls[index]!, fetcher)
      const result = results[index]!
      console.log(
        `${result.ok ? 'OK    ' : 'FALHA '} ${result.url}  ${result.reason}${result.location ? `  → ${result.location}` : ''}`,
      )
    }
  }),
)

const failures = results.filter((result) => !result.ok)
console.log(`\n${results.length - failures.length} OK, ${failures.length} com falha.`)

if (output) {
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csv = [
    'url,resultado,status,destino,status_destino,motivo',
    ...results.map((r) =>
      [r.url, r.ok ? 'OK' : 'FALHA', r.status, r.location, r.finalStatus, r.reason]
        .map(escape)
        .join(','),
    ),
  ].join('\n')
  await writeFile(path.resolve(cwd, output), `${csv}\n`)
  console.log(`Relatório: ${path.resolve(cwd, output)}`)
}

process.exit(failures.length > 0 ? 1 : 0)
