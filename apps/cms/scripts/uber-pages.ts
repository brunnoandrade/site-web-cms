/** WARNING: overwrites CMS content with the data of the old site; initial load only, never run it once editors own the content (docs/uber-conta.md).
 * Creates or updates the Uber Conta inner pages. Usage: npm run -w cms uber:pages [slug ...] (body in src/endpoints/seed/uber-content.ts). */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seedUberPages } from '../src/endpoints/seed/uber-content'

const payload = await getPayload({ config })
await seedUberPages(
  payload,
  process.argv.slice(2).filter((arg) => !arg.startsWith('-')),
)
process.exit(0)
