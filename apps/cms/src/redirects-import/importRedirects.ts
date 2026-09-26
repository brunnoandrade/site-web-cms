import type { Payload } from 'payload'
import { commitTransaction, createLocalReq, initTransaction, killTransaction } from 'payload'
import { normalizePath } from '@digio/routes'

import { publishedDocumentAt, tenantDomains, tenantRedirects } from '../collections/Redirects/hooks'
import {
  checkRedirect,
  customDestinationPath,
  type RedirectSummary,
} from '../collections/Redirects/rules'
import type { RedirectRow, RowError } from './parseCsv'

export type ImportOptions = {
  /** Tenant slug for rows without a `tenant` column. */
  defaultTenant?: string
  /** Wave applied to rows without a `wave` column. */
  defaultWave?: RedirectRow['wave']
  /** Validate everything, write nothing. */
  dryRun?: boolean
}

export type ImportReport = {
  created: number
  updated: number
  unchanged: number
  errors: RowError[]
  written: boolean
}

type PlannedRow = RedirectRow & { tenantID: number; from: string; destinationPath: string | null }

/**
 * Imports redirects in two phases:
 * 1. validation of every row, without writing, against the existing redirects and the other
 *    rows of the file (duplicates, loops, chains, published content hidden by a redirect);
 * 2. only when no row has errors (and not a dry run): writes everything in one transaction.
 * Idempotent: a row whose source already exists updates that redirect.
 */
export async function importRedirects(
  payload: Payload,
  input: RedirectRow[],
  { defaultTenant, defaultWave, dryRun = false }: ImportOptions = {},
): Promise<ImportReport> {
  const report: ImportReport = { created: 0, updated: 0, unchanged: 0, errors: [], written: false }
  const req = await createLocalReq({}, payload)
  const error = (line: number, message: string) => report.errors.push({ line, message })

  // Tenants
  const tenantIDs = new Map<string, number>()
  const planned: PlannedRow[] = []
  for (const row of input) {
    const slug = row.tenant ?? defaultTenant
    if (!slug) {
      error(row.line, 'Propriedade não informada (coluna "tenant" ou tenant=<slug> no comando).')
      continue
    }
    if (!tenantIDs.has(slug)) {
      const { docs } = await payload.find({
        collection: 'tenants',
        depth: 0,
        limit: 1,
        where: { slug: { equals: slug } },
      })
      if (docs[0]) tenantIDs.set(slug, docs[0].id)
    }
    const tenantID = tenantIDs.get(slug)
    if (tenantID === undefined) {
      error(row.line, `Propriedade "${slug}" não existe.`)
      continue
    }

    let from: string
    try {
      from = normalizePath(row.from)
    } catch {
      error(row.line, `Origem "${row.from}" inválida.`)
      continue
    }

    const domains = await tenantDomains(req, tenantID)
    planned.push({
      ...row,
      wave: row.wave ?? defaultWave,
      tenantID,
      from,
      destinationPath: customDestinationPath(row.to, domains),
    })
  }

  // Phase 1: validation against existing redirects + the file itself
  const existingByTenant = new Map<number, RedirectSummary[]>()
  for (const tenantID of new Set(planned.map((row) => row.tenantID))) {
    existingByTenant.set(tenantID, await tenantRedirects(req, tenantID))
  }

  const existingFrom = new Map<string, RedirectSummary>()
  for (const [tenantID, redirects] of existingByTenant) {
    for (const redirect of redirects) existingFrom.set(`${tenantID}:${redirect.from}`, redirect)
  }

  for (const row of planned) {
    const fileRows = planned.filter((other) => other.tenantID === row.tenantID)
    const sameSourceInFile = fileRows.filter((other) => other.from === row.from)
    if (sameSourceInFile.length > 1) {
      error(
        row.line,
        `Origem ${row.from} repetida no arquivo (linhas ${sameSourceInFile.map((r) => r.line).join(', ')}).`,
      )
      continue
    }

    // The state after the import: existing redirects (replaced by file rows with the same source) + file rows.
    const others: RedirectSummary[] = [
      ...(existingByTenant.get(row.tenantID) ?? []).filter(
        (redirect) =>
          redirect.from !== row.from && !fileRows.some((other) => other.from === redirect.from),
      ),
      ...fileRows
        .filter((other) => other.line !== row.line)
        .map((other) => ({
          id: `line:${other.line}`,
          from: other.from,
          destinationPath: other.destinationPath,
        })),
    ]

    for (const problem of checkRedirect(
      { id: `line:${row.line}`, from: row.from, destinationPath: row.destinationPath },
      others,
    )) {
      error(row.line, problem.message)
    }

    if (row.active && (await publishedDocumentAt(req, row.tenantID, row.from))) {
      error(row.line, `Existe um conteúdo publicado em ${row.from}: o redirect o esconderia.`)
    }
  }

  // Counts (also shown in dry runs)
  const changes = planned.map((row) => {
    const existing = existingFrom.get(`${row.tenantID}:${row.from}`)
    return { row, existing }
  })

  if (report.errors.length > 0 || dryRun) {
    for (const { existing } of changes) {
      if (existing) report.updated++
      else report.created++
    }
    report.errors.sort((a, b) => a.line - b.line)
    return report
  }

  // Phase 2: write everything in one transaction
  await initTransaction(req)
  try {
    for (const { row, existing } of changes) {
      const data = {
        tenant: row.tenantID,
        from: row.from,
        to: { type: 'custom' as const, url: row.to },
        type: row.type,
        wave: row.wave ?? null,
        active: row.active,
      }

      if (!existing) {
        await payload.create({ collection: 'redirects', data: { ...data, origin: 'import' }, req })
        report.created++
        continue
      }

      const current = await payload.findByID({
        collection: 'redirects',
        id: existing.id!,
        depth: 0,
        req,
      })
      const same =
        current.to?.type === 'custom' &&
        current.to.url === row.to &&
        (current.type ?? '301') === row.type &&
        (current.wave ?? null) === (row.wave ?? null) &&
        (current.active ?? true) === row.active

      if (same) {
        report.unchanged++
      } else {
        await payload.update({ collection: 'redirects', id: existing.id!, data, req })
        report.updated++
      }
    }
    await commitTransaction(req)
    report.written = true
  } catch (err) {
    await killTransaction(req)
    report.errors.push({
      line: 0,
      message: `Importação interrompida e desfeita: ${(err as Error).message}`,
    })
    report.created = report.updated = report.unchanged = 0
  }

  return report
}
