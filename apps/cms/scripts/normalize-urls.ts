/**
 * Writes the internal custom links of a property in its URL form (tenant `trailingSlash`): menu,
 * footer and page links typed as "/pix/" become "/pix" (or the other way round). External URLs,
 * anchors and the rest of the content are left alone. Safe to run again.
 * Usage: npm run -w cms urls:normalize tenant=uber-conta [dry-run]
 */
import config from '@payload-config'
import { urlStyleOf, withStyle } from '@digio/routes'
import { getPayload } from 'payload'

const args = process.argv.slice(2)
const tenantSlug = args.find((arg) => arg.startsWith('tenant='))?.slice('tenant='.length)
const dryRun = args.includes('dry-run')
if (!tenantSlug) throw new Error('Usage: urls:normalize tenant=<slug> [dry-run]')

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'tenants',
  where: { slug: { equals: tenantSlug } },
  limit: 1,
})
const tenant = docs[0]
if (!tenant) throw new Error(`Tenant ${tenantSlug} not found`)
const style = urlStyleOf(tenant)

let changed = 0
const walk = (node: unknown): unknown => {
  if (Array.isArray(node)) return node.map(walk)
  if (node && typeof node === 'object') {
    const value = node as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value)) out[key] = walk(child)
    if (value.type === 'custom' && typeof value.url === 'string' && value.url.startsWith('/')) {
      const next = withStyle(value.url, style)
      if (next !== value.url) {
        changed++
        out.url = next
      }
    }
    return out
  }
  return node
}

for (const collection of ['header', 'footer', 'pages'] as const) {
  const { docs: items } = await payload.find({
    collection,
    where: { tenant: { equals: tenant.id } },
    depth: 0,
    limit: 0,
    pagination: false,
    draft: collection === 'pages',
  })
  for (const item of items) {
    const before = changed
    const data = walk(item) as Record<string, unknown>
    if (changed === before || dryRun) continue
    delete data.id
    delete data.createdAt
    delete data.updatedAt
    await payload.update({ collection, id: item.id, data: data as never, depth: 0 })
  }
  console.log(`${collection}: ${items.length} documentos`)
}
console.log(`${changed} links ${dryRun ? 'a ajustar (dry-run)' : 'ajustados'} em ${tenantSlug}.`)
process.exit(0)
