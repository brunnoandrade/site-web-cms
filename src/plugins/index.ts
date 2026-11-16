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
  superAdminOnly,
  TENANT_ROLES,
} from '@/access/roles'
import {
  GenerateDescription,
  GenerateImage,
  GenerateTitle,
  GenerateURL,
} from '@payloadcms/plugin-seo/types'
import { labelSearchField, searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import type { Config, Page, Post } from '@/payload-types'
import { getTenantSiteURL } from '@/utilities/tenantSite'
import { t } from '@/utilities/labels'
import { excerpt, lexicalText } from '@/utilities/seo'

// The title only: the website adds the property's suffix (" | Digio", " • Uber Conta") on the <title>.
const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => doc?.title ?? ''

// Start of the post text (the form data holds the raw Lexical tree), cut for Google's snippet.
const generateDescription: GenerateDescription<Post | Page> = ({ doc }) => {
  const content = (doc as Partial<Post>)?.content
  return content ? excerpt(lexicalText((content as { root?: unknown }).root)) : ''
}

// Featured image of a post or hero image of a page (ids in the form data); videos do not count.
const generateImage: GenerateImage<Post | Page> = ({ doc }) => {
  const id = (value: unknown) =>
    typeof value === 'object' && value ? (value as { id?: number | string }).id : value
  const image = (doc as Partial<Post>)?.heroImage ?? (doc as Partial<Page>)?.hero?.media
  return (id(image) as string) ?? ''
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

/**
 * seoPlugin 3.90 only answers its "generate" endpoints (URL, title, description, image) for the
 * collections listed in `collections`, and lists them by also appending its own `meta` group.
 * Pages and posts already carry the SEO tab (src/fields/seo.ts), so the appended group is dropped.
 * Without this the Google preview stays at "https://..." and the generate buttons answer 403.
 */
const seoCollections = ['pages', 'posts']
const seo = (config: Parameters<Plugin>[0]) => {
  const out = seoPlugin({
    collections: seoCollections,
    generateTitle,
    generateDescription,
    generateImage,
    generateURL,
  })(config)
  return {
    ...out,
    collections: out.collections?.map((collection) =>
      seoCollections.includes(collection.slug)
        ? {
            ...collection,
            fields: collection.fields.filter(
              (field) => !(field.type === 'group' && 'name' in field && field.name === 'meta'),
            ),
          }
        : collection,
    ),
  }
}

export const plugins: Plugin[] = [
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seo,
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: {
        singular: t('Resultado de busca', 'Search result'),
        plural: t('Índice de busca', 'Search index'),
      },
      admin: {
        group: t('Blog', 'Blog'),
        // Automatic copy of the posts that the blog search reads (kept by the plugin on every post
        // save). Nothing to edit there, so it is out of the admin menu for everyone.
        hidden: true,
        description: t(
          'Cópia automática dos posts usada pela busca do blog, mantida sozinha a cada post salvo, publicado ou apagado. Não edite aqui: edite o post.',
          'Automatic copy of the posts used by the blog search, kept up to date whenever a post is saved, published or deleted. Do not edit it here: edit the post.',
        ),
      },
      access: {
        read: anyone,
        update: superAdminOnly,
        delete: superAdminOnly,
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields.map(labelSearchField), ...searchFields]
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
