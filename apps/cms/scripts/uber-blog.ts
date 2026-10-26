/** WARNING: overwrites CMS content with the data of the old site; initial load only, never run it once editors own the content (docs/uber-conta.md).
 * Creates or updates the Uber Conta blog. Usage: npm run -w cms uber:blog (body in src/endpoints/seed/uber-content.ts). */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seedUberBlog } from '../src/endpoints/seed/uber-content'

const payload = await getPayload({ config })
await seedUberBlog(payload)
process.exit(0)
