/**
 * Local development bootstrap. Run with: pnpm --filter cms bootstrap:dev
 *
 * Creates (or updates) the demo tenants, a super-admin, the preview service account and seeds
 * demo content into each tenant. Refuses to run with NODE_ENV=production.
 *
 * Env: BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (required on the first run; without
 * them an existing database only gets its content re-seeded), CMS_API_KEY (optional: API key of
 * the preview account; must match apps/web/.env).
 */
import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { seed } from '../src/endpoints/seed'
import { revalidateAllWeb } from '../src/utilities/revalidateWeb'

if (process.env.NODE_ENV === 'production') {
  throw new Error('bootstrap-dev must not run in production')
}

const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL
const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD

const tenants = [
  {
    name: 'Digio',
    slug: 'digio',
    siteUrl: 'http://localhost:3000',
    domains: [{ domain: 'localhost' }, { domain: '127.0.0.1' }],
  },
  {
    // *.localhost resolves to 127.0.0.1 in browsers and curl: no /etc/hosts change needed.
    name: 'Campanha Exemplo',
    slug: 'campanha-exemplo',
    siteUrl: 'http://campanha.localhost:3000',
    domains: [{ domain: 'campanha.localhost' }],
  },
]

const payload = await getPayload({ config })
const req = await createLocalReq({}, payload)

async function upsert<T extends 'tenants' | 'users'>(
  collection: T,
  field: 'slug' | 'email',
  value: string,
  data: Record<string, unknown>,
) {
  const { docs } = await payload.find({
    collection,
    req,
    depth: 0,
    where: { [field]: { equals: value } },
  })
  return docs[0]
    ? payload.update({ collection, id: docs[0].id, req, data: data as never })
    : payload.create({ collection, req, data: data as never })
}

const tenantDocs = []
for (const tenant of tenants) {
  tenantDocs.push(await upsert('tenants', 'slug', tenant.slug, tenant))
  payload.logger.info(
    `Tenant ready: ${tenant.slug} (${tenant.domains.map((d) => d.domain).join(', ')})`,
  )
}

if (adminEmail && adminPassword) {
  await upsert('users', 'email', adminEmail, {
    name: 'Super Admin',
    email: adminEmail,
    password: adminPassword,
    roles: ['super-admin'],
  })
  payload.logger.info(`Super-admin ready: ${adminEmail}`)
} else {
  const { totalDocs } = await payload.count({
    collection: 'users',
    req,
    where: { roles: { contains: 'super-admin' } },
  })
  if (totalDocs === 0) throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD')
  payload.logger.info('Super-admin unchanged (BOOTSTRAP_ADMIN_* not set)')
}

if (process.env.CMS_API_KEY) {
  await upsert('users', 'email', 'preview@digio.local', {
    name: 'Preview (serviço)',
    email: 'preview@digio.local',
    password: crypto.randomUUID(),
    roles: ['preview'],
    enableAPIKey: true,
    apiKey: process.env.CMS_API_KEY,
  })
  payload.logger.info('Preview service account ready: preview@digio.local')
}

for (const tenant of tenantDocs) {
  await seed({ payload, req, tenant: tenant as never })
}

// The seed skips per-document revalidation: refresh the website cache once at the end.
payload.logger.info(
  (await revalidateAllWeb())
    ? 'Website cache refreshed'
    : 'Website not reachable: its cache refreshes when it restarts or on the next publish',
)

process.exit(0)
