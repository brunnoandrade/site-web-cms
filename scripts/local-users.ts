/**
 * Local development users, one per profile, all with the same easy password.
 * Run with: npm run users:local
 *
 * Idempotent (creates or updates by e-mail). Refuses to run with NODE_ENV=production.
 * Needs the tenants from `npm run bootstrap:dev`. Never use these accounts outside the local machine.
 */
import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

if (process.env.NODE_ENV === 'production') {
  throw new Error('local-users must not run in production')
}

const PASSWORD = process.env.LOCAL_USERS_PASSWORD || 'digio123'

type TenantRole = 'admin' | 'editor' | 'seo'
type Profile = {
  email: string
  name: string
  roles?: 'super-admin'[]
  tenants?: { slug: string; roles: TenantRole[] }[]
}

const profiles: Profile[] = [
  { email: 'admin@digio.local', name: 'Super Admin', roles: ['super-admin'] },
  { email: 'admin.digio@digio.local', name: 'Admin Digio', tenants: [{ slug: 'digio', roles: ['admin'] }] },
  { email: 'editor.digio@digio.local', name: 'Editor Digio', tenants: [{ slug: 'digio', roles: ['editor'] }] },
  { email: 'seo.digio@digio.local', name: 'SEO Digio', tenants: [{ slug: 'digio', roles: ['seo'] }] },
  { email: 'admin.uber@digio.local', name: 'Admin Uber Conta', tenants: [{ slug: 'uber-conta', roles: ['admin'] }] },
  { email: 'editor.uber@digio.local', name: 'Editor Uber Conta', tenants: [{ slug: 'uber-conta', roles: ['editor'] }] },
  { email: 'seo.uber@digio.local', name: 'SEO Uber Conta', tenants: [{ slug: 'uber-conta', roles: ['seo'] }] },
  {
    email: 'multi@digio.local',
    name: 'Multi propriedade',
    tenants: [
      { slug: 'digio', roles: ['seo'] },
      { slug: 'uber-conta', roles: ['editor'] },
    ],
  },
]

const payload = await getPayload({ config })
const req = await createLocalReq({}, payload)

const { docs: tenantDocs } = await payload.find({ collection: 'tenants', limit: 0, req })
const tenantID = (slug: string) => {
  const tenant = tenantDocs.find((doc) => doc.slug === slug)
  if (!tenant) throw new Error(`Tenant "${slug}" not found: run npm run bootstrap:dev first`)
  return tenant.id
}

for (const profile of profiles) {
  const data = {
    name: profile.name,
    email: profile.email,
    password: PASSWORD,
    roles: profile.roles ?? [],
    tenants: (profile.tenants ?? []).map(({ slug, roles }) => ({ tenant: tenantID(slug), roles })),
  }
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: profile.email } },
    limit: 1,
    req,
  })
  if (docs[0]) {
    await payload.update({ collection: 'users', id: docs[0].id, data: data as never, req })
  } else {
    await payload.create({ collection: 'users', data: data as never, req })
  }
  payload.logger.info(`User ready: ${profile.email}`)
}

process.exit(0)
