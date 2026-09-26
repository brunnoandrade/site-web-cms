import type { CollectionConfig } from 'payload'
import { slug } from '../fields/slug'

import { anyone, tenantRoles } from '../access/roles'
import { wpIdField } from '../fields/wpId'
import { revalidateTenantContent } from '../hooks/revalidateTenantContent'
import { t } from '../utilities/labels'
import { redirectCategoryOnSlugChange } from './Redirects/hooks'

const revalidate = revalidateTenantContent(['posts', 'categories', 'posts-sitemap'])

/**
 * Blog categories. The slug is part of every post URL (/blog/<categoria>/<slug>/): changing it
 * creates the redirects for all published posts of the category and for the category page.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: t('Categoria do blog', 'Blog category'),
    plural: t('Categorias do blog', 'Blog categories'),
  },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: anyone,
    update: tenantRoles(['admin', 'editor']),
  },
  // Slugs are unique per tenant, not across the whole platform.
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  admin: {
    group: t('Blog', 'Blog'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      label: t('Nome', 'Name'),
      type: 'text',
      required: true,
    },
    slug({
      disableUnique: true,
      position: undefined,
    }),
    {
      name: 'description',
      label: t('Descrição', 'Description'),
      type: 'textarea',
      admin: {
        description: t(
          'Aparece na página da categoria e como descrição de SEO.',
          'Shown on the category page and as its SEO description.',
        ),
      },
    },
    wpIdField,
  ],
  hooks: {
    afterChange: [redirectCategoryOnSlugChange, revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
}
