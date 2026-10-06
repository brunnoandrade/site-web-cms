import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/** Media uploads accept an allowlist of safe types only (SVG/HTML can carry script). */

let payload: Payload
let tenantID: number
const context = { disableRevalidate: true }
const run = `${Date.now()}`

// 1x1 transparent PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

const upload = (name: string, mimetype: string, data: Buffer) =>
  payload.create({
    collection: 'media',
    context,
    data: { alt: name, tenant: tenantID },
    file: { data, mimetype, name, size: data.length },
  })

describe('media upload allowlist', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Upload test',
        slug: `upload-${run}`,
        siteUrl: 'http://upload.test.local',
        domains: [{ domain: `upload-${run}.test.local` }],
      },
    })
    tenantID = tenant.id
  })

  afterAll(async () => {
    await payload.delete({ collection: 'media', context, where: { tenant: { equals: tenantID } } })
    await payload.delete({ collection: 'tenants', where: { id: { equals: tenantID } } })
  })

  it('accepts a PNG', async () => {
    const doc = await upload(`ok-${run}.png`, 'image/png', png)
    expect(doc.mimeType).toBe('image/png')
  })

  it('refuses an SVG with script', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    )
    await expect(upload(`x-${run}.svg`, 'image/svg+xml', svg)).rejects.toThrow()
  })

  it('refuses HTML', async () => {
    const html = Buffer.from('<html><script>alert(1)</script></html>')
    await expect(upload(`x-${run}.html`, 'text/html', html)).rejects.toThrow()
  })
})
