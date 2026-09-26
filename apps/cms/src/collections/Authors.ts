import type { CollectionConfig } from 'payload'
import { slug } from '../fields/slug'

import { anyone, tenantRoles } from '../access/roles'
import { revalidateTenantContent } from '../hooks/revalidateTenantContent'
import { t } from '../utilities/labels'
import { wpIdField } from '../fields/wpId'

const revalidate = revalidateTenantContent(['posts', 'authors'])

/** Blog authors (public profiles), separate from the admin users. Imported from WordPress. */
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: t('Autor', 'Author'), plural: t('Autores', 'Authors') },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: anyone,
    update: tenantRoles(['admin', 'editor']),
  },
  admin: {
    group: t('Blog', 'Blog'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', label: t('Nome', 'Name'), type: 'text', required: true },
    slug({ useAsSlug: 'name', disableUnique: true }),
    { name: 'bio', label: t('Minibiografia', 'Short bio'), type: 'textarea' },
    { name: 'avatar', label: t('Foto', 'Photo'), type: 'upload', relationTo: 'media' },
    wpIdField,
  ],
  hooks: { afterChange: [revalidate.afterChange], afterDelete: [revalidate.afterDelete] },
}
