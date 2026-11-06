import { routablePath } from '@/utilities/routablePath'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import type { Plugin } from 'payload'
import {
  anyone,
  getTenantIDsWithRoles,
  isPreviewReader,
  isSuperAdmin,
  TENANT_ROLES,
} from '@/access/roles'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import type { Config, Page, Post } from '@/payload-types'
import { getTenantSiteURL } from '@/utilities/tenantSite'
import { t } from '@/utilities/labels'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Digio` : 'Digio'
}

// Canonical URL on the document's own website (its tenant's siteUrl).
const generateURL: GenerateURL<Post | Page> = async ({ doc, collectionConfig, req }) => {
  const url = await getTenantSiteURL(req, doc?.tenant)
  if (!doc?.slug) return url
  const path = await routablePath(req, collectionConfig?.slug === 'posts' ? 'posts' : 'pages', doc)
  return path ? `${url}${path}` : url
}

type TenantScoped = keyof Config['collections']

const canManageTenantRows = (user: Parameters<typeof isSuperAdmin>[0]) =>
  isSuperAdmin(user) || getTenantIDsWithRoles(user, ['admin']).length > 0

const tenantScopedCollections: TenantScoped[] = [
  'pages',
  'posts',
  'categories',
  'authors',
  'media',
  'faqs',
  'help-categories',
  'help-topics',
  'search',
]

export const plugins: Plugin[] = [
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: {
        singular: t('Resultado de busca', 'Search result'),
        plural: t('Índice de busca', 'Search index'),
      },
      admin: { group: t('Blog', 'Blog') },
      access: {
        read: anyone,
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  multiTenantPlugin<Config>({
    collections: {
      ...Object.fromEntries(tenantScopedCollections.map((slug) => [slug, {}])),
      header: { isGlobal: true },
      footer: { isGlobal: true },
    },
    tenantField: {
      admin: { position: 'sidebar' },
    },
    tenantsArrayField: {
      includeDefaultField: true,
      // Super-admins and tenant admins edit users' tenant rows; the validateTenantAssignments
      // hook (collections/Users) then limits tenant admins to rows of tenants they administer.
      arrayFieldAccess: {
        create: ({ req: { user } }) => canManageTenantRows(user),
        update: ({ req: { user } }) => canManageTenantRows(user),
      },
      rowFields: [
        {
          name: 'roles',
          label: 'Papéis nesta propriedade',
          type: 'select',
          hasMany: true,
          required: true,
          defaultValue: ['editor'],
          options: TENANT_ROLES.map((role) => ({ label: role, value: role })),
          saveToJWT: true,
        },
      ],
    },
    // Super-admins manage every tenant; the preview service account reads every tenant.
    userHasAccessToAllTenants: (user) => isSuperAdmin(user) || isPreviewReader(user),
    i18n: {
      translations: {
        pt: {
          'nav-tenantSelector-label': 'Propriedade',
          'assign-tenant-button-label': 'Mover para outra propriedade',
          'field-assignedTenant-label': 'Propriedade',
        },
      },
    },
  }),
  // The multi-tenant plugin sends the list view of Cabeçalho and Rodapé straight to one document:
  // keep that check for the document view only, so the list can show every property.
  (config) => {
    const actions = config.admin?.components?.actions
    if (!actions) return config
    return {
      ...config,
      admin: {
        ...config.admin,
        components: {
          ...config.admin?.components,
          actions: actions.map((action) =>
            typeof action === 'object' && action.path?.endsWith('#GlobalViewRedirect')
              ? { ...action, path: '@/components/admin/LayoutViewRedirect#LayoutViewRedirect' }
              : action,
          ),
        },
      },
    }
  },
]
