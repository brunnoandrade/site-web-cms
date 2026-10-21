/** Creates or updates the Uber Conta help center. Usage: npm run -w cms uber:help (body in src/endpoints/seed/uber-content.ts). */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seedUberHelp } from '../src/endpoints/seed/uber-content'

const payload = await getPayload({ config })
await seedUberHelp(payload)
process.exit(0)
