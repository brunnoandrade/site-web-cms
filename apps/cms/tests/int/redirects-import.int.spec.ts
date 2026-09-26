import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import type { Tenant } from '@digio/payload-types'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { importRedirects } from '@/redirects-import/importRedirects'
import { parseRedirectCsv } from '@/redirects-import/parseCsv'

/** CSV import (scripts/import-redirects.ts): all-or-nothing, dry run and idempotency. */

let payload: Payload
const run = `${Date.now()}`
let tenant: Tenant

const csv = (...lines: string[]) =>
  parseRedirectCsv(['from,to,type,wave,active', ...lines].join('\n')).rows
const count = async () =>
  (await payload.count({ collection: 'redirects', where: { tenant: { equals: tenant.id } } }))
    .totalDocs

describe('redirects CSV import', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Import',
        slug: `import-${run}`,
        siteUrl: 'http://import.local',
        domains: [{ domain: `import-${run}.local` }],
      },
    })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'redirects',
      context: { disableRevalidate: true },
      where: { tenant: { equals: tenant.id } },
    })
    await payload.delete({ collection: 'tenants', id: tenant.id })
  })

  const valid = () => csv('/a,/destino-a/,301,1,true', '/b/,https://externo.test/,302,,false')

  it('a dry run validates without writing', async () => {
    const report = await importRedirects(payload, valid(), {
      defaultTenant: tenant.slug,
      dryRun: true,
    })
    expect(report).toMatchObject({ created: 2, errors: [], written: false })
    expect(await count()).toBe(0)
  })

  it('writes nothing when any row is invalid (chain inside the file)', async () => {
    const rows = csv('/a,/destino-a/,301,,', '/x/,/y/,301,,', '/y/,/z/,301,,')
    const report = await importRedirects(payload, rows, { defaultTenant: tenant.slug })
    expect(report.written).toBe(false)
    expect(report.errors.map((error) => error.line).sort()).toEqual([3, 4])
    expect(await count()).toBe(0)
  })

  it('imports valid rows with origin "import"', async () => {
    const report = await importRedirects(payload, valid(), { defaultTenant: tenant.slug })
    expect(report).toMatchObject({ created: 2, updated: 0, written: true })
    const { docs } = await payload.find({
      collection: 'redirects',
      where: { tenant: { equals: tenant.id } },
      sort: 'from',
    })
    expect(
      docs.map((doc) => [doc.from, doc.origin, doc.type, doc.wave ?? null, doc.active]),
    ).toEqual([
      ['/a/', 'import', '301', '1', true],
      ['/b/', 'import', '302', null, false],
    ])
  })

  it('is idempotent and updates changed rows', async () => {
    expect(await importRedirects(payload, valid(), { defaultTenant: tenant.slug })).toMatchObject({
      created: 0,
      updated: 0,
      unchanged: 2,
    })
    const changed = csv('/a,/destino-a/,301,2,true', '/b/,https://externo.test/,302,,false')
    expect(await importRedirects(payload, changed, { defaultTenant: tenant.slug })).toMatchObject({
      updated: 1,
      unchanged: 1,
    })
    expect(await count()).toBe(2)
  })

  it('reports unknown tenants', async () => {
    const report = await importRedirects(payload, csv('/c/,/d/,,,'), {
      defaultTenant: 'nao-existe',
    })
    expect(report.errors[0]?.message).toMatch(/não existe/)
  })
})
