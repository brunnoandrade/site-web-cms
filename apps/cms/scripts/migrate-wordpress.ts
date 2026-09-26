/**
 * Blog migration from the current WordPress. Run from the repository root:
 *
 *   pnpm --filter cms blog:migrate tenant=digio [source=https://www.digio.com.br/blog] [limit=20] [dry-run] [force]
 *
 * - dry-run: reads and converts everything, writes nothing;
 * - force:   re-imports posts even when unchanged in WordPress;
 * - limit:   only the first N posts (oldest first), to test.
 * Safe to run again: nothing is duplicated (see src/wordpress/migrate.ts).
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { revalidateAllWeb } from '../src/utilities/revalidateWeb'
import { migrateWordPress } from '../src/wordpress/migrate'

const args = process.argv.slice(2)
const option = (name: string) =>
  args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1)
const flag = (name: string) => args.includes(name)

const tenant = option('tenant')
if (!tenant) {
  console.error(
    'Uso: pnpm --filter cms blog:migrate tenant=<slug> [source=<url do blog>] [limit=N] [dry-run] [force]',
  )
  process.exit(1)
}

const source = option('source') ?? process.env.WP_BLOG_URL ?? 'https://www.digio.com.br/blog'
const limit = option('limit') ? Number(option('limit')) : undefined
const dryRun = flag('dry-run')

console.log(
  `Migrando ${source} -> propriedade "${tenant}"${dryRun ? ' (simulação, nada será gravado)' : ''}`,
)

const payload = await getPayload({ config })
const started = Date.now()
const report = await migrateWordPress(payload, {
  source,
  tenant,
  limit,
  dryRun,
  force: flag('force'),
  log: (message) => console.log(`  ${message}`),
})

const { posts } = report
console.log(`
Posts: ${posts.created} novos, ${posts.updated} atualizados, ${posts.unchanged} sem mudança, ${posts.failed} com erro
Categorias novas: ${report.categories} · Autores novos: ${report.authors}
Imagens: ${report.media.imported} importadas, ${report.media.reused} reaproveitadas
Vídeos convertidos em link: ${report.videos}
URLs diferentes do WordPress (redirect criado): ${report.urlChanges.length}`)

for (const change of report.urlChanges) console.log(`  ${change.from} -> ${change.to}`)
if (report.wpContentLinks.length > 0) {
  console.log(
    `\nLinks para arquivos do WordPress (wp-content) no conteúdo: ${report.wpContentLinks.length}`,
  )
  for (const link of report.wpContentLinks.slice(0, 20)) console.log(`  ${link}`)
}
if (report.contentLoss.length > 0) {
  console.log(`\nConteúdo perdido na conversão (${report.contentLoss.length} posts), revisar:`)
  for (const loss of report.contentLoss) console.log(`  post ${loss.post}: ${loss.lost.join(', ')}`)
}
if (report.errors.length > 0) {
  console.log(`\nErros:`)
  for (const error of report.errors) console.log(`  post ${error.post}: ${error.message}`)
}

if (!dryRun) {
  console.log(
    (await revalidateAllWeb())
      ? '\nCache do site atualizado.'
      : '\nSite fora do ar: o cache atualiza no próximo acesso.',
  )
}
console.log(`Tempo: ${Math.round((Date.now() - started) / 1000)}s`)

process.exit(report.errors.length > 0 || report.contentLoss.length > 0 ? 1 : 0)
