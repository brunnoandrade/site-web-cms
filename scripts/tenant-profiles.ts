/**
 * Applies the public data of each property (analytics, company, social networks, default
 * description, icons) to the CMS. Run with: npm run tenants:profile
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seedTenantProfiles } from '../src/endpoints/seed/tenant-profiles'
import { revalidateAllWeb } from '../src/utilities/revalidateWeb'

const payload = await getPayload({ config })
await seedTenantProfiles(payload)
await revalidateAllWeb()
process.exit(0)
