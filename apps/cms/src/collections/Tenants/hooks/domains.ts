import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'

type DomainRow = { domain?: string | null; id?: string | null }

/** Lowercases hosts and strips protocol, port and path ("https://Foo.com:443/x" -> "foo.com"). */
export const normalizeDomain = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '')

export const normalizeDomains: CollectionBeforeValidateHook = ({ data }) => {
  if (data?.domains && Array.isArray(data.domains)) {
    data.domains = (data.domains as DomainRow[]).map((row) => ({
      ...row,
      domain: typeof row.domain === 'string' ? normalizeDomain(row.domain) : row.domain,
    }))
  }
  return data
}

/** A host must map to exactly one tenant, otherwise the website could serve the wrong property. */
export const validateUniqueDomains: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const domains = ((data.domains ?? []) as DomainRow[])
    .map((row) => row.domain)
    .filter((domain): domain is string => Boolean(domain))

  const duplicated = domains.find((domain, i) => domains.indexOf(domain) !== i)
  if (duplicated) {
    throw new ValidationError({
      errors: [{ path: 'domains', message: `Domínio repetido: ${duplicated}` }],
    })
  }

  if (domains.length === 0) return data

  const { docs } = await req.payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [
        { 'domains.domain': { in: domains } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })

  if (docs[0]) {
    const taken = (docs[0].domains ?? []).find((row) => domains.includes(row.domain))?.domain
    throw new ValidationError({
      errors: [
        {
          path: 'domains',
          message: `O domínio ${taken} já pertence à propriedade "${docs[0].name}".`,
        },
      ],
    })
  }

  return data
}
