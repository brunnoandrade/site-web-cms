/**
 * Bulk import of redirects from CSV. Run from apps/cms:
 *
 *   pnpm --filter cms redirects:import <arquivo.csv> [tenant=<slug>] [wave=<1-4>] [dry-run]
 *
 * CSV format: src/redirects-import/parseCsv.ts. Nothing is written when any row has an error;
 * `dry-run` only validates. Safe to run again: existing sources are updated, not duplicated.
 */
import config from '@payload-config'
import { readFile } from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'

import { importRedirects } from '../src/redirects-import/importRedirects'
import { parseRedirectCsv, type RedirectRow } from '../src/redirects-import/parseCsv'

const args = process.argv.slice(2)
const file = args.find((arg) => !arg.includes('=') && arg !== 'dry-run')
const option = (name: string) => args.find((arg) => arg.startsWith(`${name}=`))?.split('=')[1]
const dryRun = args.includes('dry-run')

if (!file) {
  console.error(
    'Uso: pnpm --filter cms redirects:import <arquivo.csv> [tenant=<slug>] [wave=<1-4>] [dry-run]',
  )
  process.exit(1)
}

const wave = option('wave')
if (wave && !['1', '2', '3', '4'].includes(wave)) {
  console.error(`wave=${wave} inválido: use 1, 2, 3 ou 4.`)
  process.exit(1)
}

// Relative paths are resolved from where the command was typed (pnpm runs it inside apps/cms).
const csvPath = path.resolve(process.env.INIT_CWD ?? process.cwd(), file)
const { rows, errors: parseErrors } = parseRedirectCsv(await readFile(csvPath, 'utf8'))

const payload = await getPayload({ config })
const report = await importRedirects(payload, rows, {
  defaultTenant: option('tenant'),
  defaultWave: wave as RedirectRow['wave'],
  dryRun,
})

const errors = [...parseErrors, ...report.errors].sort((a, b) => a.line - b.line)

console.log('')
console.log(`Arquivo: ${csvPath}`)
console.log(`Linhas válidas: ${rows.length}`)
if (errors.length > 0) {
  console.log(`\nErros (${errors.length}):`)
  for (const { line, message } of errors) console.log(`  linha ${line}: ${message}`)
}
console.log('')
if (dryRun) {
  console.log(`Simulação (nada gravado): ${report.created} novos, ${report.updated} já existentes.`)
} else if (report.written) {
  console.log(
    `Gravado: ${report.created} criados, ${report.updated} atualizados, ${report.unchanged} sem mudança.`,
  )
} else {
  console.log('Nada foi gravado: corrija os erros e rode de novo.')
}

process.exit(errors.length > 0 ? 1 : 0)
