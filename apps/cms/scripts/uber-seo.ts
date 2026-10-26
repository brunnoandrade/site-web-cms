/**
 * WARNING: overwrites CMS content with the data of the old site; initial load only, never run it once editors own the content (docs/uber-conta.md).
 *
 * Applies the SEO data of the current Uber Conta site to the CMS (see seed/uber-seo.ts).
 * Usage: npm run -w cms uber:seo
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seedUberSeo } from '../src/endpoints/seed/uber-seo'

const payload = await getPayload({ config })
const { updated, missing } = await seedUberSeo(payload)
console.log(`SEO applied to ${updated} documents.`)
if (missing.length) console.log(`No page or post for: ${missing.join(', ')}`)
process.exit(0)
