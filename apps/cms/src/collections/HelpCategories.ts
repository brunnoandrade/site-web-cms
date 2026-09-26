import type { CollectionConfig } from 'payload'
import { slug } from '../fields/slug'

import { anyone, tenantRoles } from '../access/roles'
import { revalidateTenantContent } from '../hooks/revalidateTenantContent'
import { t } from '../utilities/labels'

const revalidate = revalidateTenantContent(['help'])

/** Categories used to navigate the help center (no search of its own in F1). */
export const HelpCategories: CollectionConfig = {
  slug: 'help-categories',
  labels: {
    singular: t('Categoria da ajuda', 'Help category'),
    plural: t('Categorias da ajuda', 'Help categories'),
  },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: anyone,
    update: tenantRoles(['admin', 'editor']),
  },
  admin: {
    group: t('Central de ajuda', 'Help center'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'updatedAt'],
  },
  defaultSort: 'order',
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'title', label: t('Título', 'Title'), type: 'text', required: true },
    slug({ disableUnique: true }),
    { name: 'description', label: t('Descrição', 'Description'), type: 'textarea' },
    {
      name: 'order',
      label: t('Ordem', 'Order'),
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: t('Menor aparece primeiro.', 'Lower comes first.'),
      },
    },
  ],
  hooks: { afterChange: [revalidate.afterChange], afterDelete: [revalidate.afterDelete] },
}
