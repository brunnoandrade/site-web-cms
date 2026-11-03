import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'

/**
 * Stores each upload under `tenants/<tenant-slug>/` in the bucket, so media is isolated per
 * tenant. Always derived from the document's tenant: editors cannot choose the folder.
 */
export const setTenantPrefix: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const tenant = data?.tenant ?? originalDoc?.tenant
  const tenantID = typeof tenant === 'object' && tenant ? tenant.id : tenant

  if (!tenantID) {
    throw new ValidationError({
      errors: [{ path: 'tenant', message: 'Selecione a propriedade antes de enviar o arquivo.' }],
    })
  }

  const { slug } = await req.payload.findByID({
    collection: 'tenants',
    id: tenantID,
    depth: 0,
    overrideAccess: true,
    req,
    select: { slug: true },
  })

  return { ...data, prefix: `tenants/${slug}` }
}
