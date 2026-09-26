import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import type { CollectionBeforeValidateHook, Plugin } from 'payload'
import {
  anyone,
  getTenantIDsWithRoles,
  isPreviewReader,
  isSuperAdmin,
  tenantRoles,
  TENANT_ROLES,
} from '@/access/roles'
import { revalidateRedirects, revalidateRedirectsDelete } from '@/hooks/revalidateRedirects'
import {
  normalizeRedirectSource,
  routablePath,
  validateRedirect,
} from '@/collections/Redirects/hooks'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import type { Config, Page, Post } from '@digio/payload-types'
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

// Public form submissions do not send a tenant: inherit it from the submitted form.
const setSubmissionTenant: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data?.form) return data
  const formID = typeof data.form === 'object' ? data.form.id : data.form
  const form = await req.payload.findByID({
    collection: 'forms',
    id: formID,
    depth: 0,
    overrideAccess: true,
    req,
    select: { tenant: true },
  })
  return { ...data, tenant: typeof form.tenant === 'object' ? form.tenant?.id : form.tenant }
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
  'products',
  'rates',
  'faqs',
  'help-categories',
  'help-topics',
  'banners',
  'payload-folders',
  'redirects',
  'forms',
  'form-submissions',
  'search',
]

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    redirectTypes: ['301', '302'],
    redirectTypeFieldOverride: {
      // Optional in the schema: the default (301) applies when omitted.
      required: false,
      defaultValue: '301',
      admin: { position: 'sidebar' },
    },
    overrides: {
      labels: { singular: t('Redirect', 'Redirect'), plural: t('Redirects', 'Redirects') },
      admin: {
        group: 'SEO',
        defaultColumns: ['from', 'destinationPath', 'type', 'active', 'wave', 'origin'],
        description: t(
          'Respondidos no proxy do site, preservando a query string (utm_*, gclid, fbclid). Não são aceitos redirects em cadeia nem origens repetidas.',
          'Answered by the website proxy, keeping the query string (utm_*, gclid, fbclid). Chains and duplicated sources are refused.',
        ),
      },
      access: {
        read: anyone,
        create: tenantRoles(['admin', 'seo']),
        update: tenantRoles(['admin', 'seo']),
        delete: tenantRoles(['admin', 'seo']),
      },
      // The same source path may exist on different tenants (domains).
      indexes: [{ fields: ['tenant', 'from'], unique: true }],
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => [
        ...defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              unique: false,
              index: true,
              admin: {
                description: t(
                  'Caminho antigo, relativo ao domínio da propriedade (ex.: /cartao/). Aceita URL completa; a query string é ignorada.',
                  'Old path, relative to the property domain (e.g. /cartao/). Full URLs are accepted; the query string is ignored.',
                ),
              },
            }
          }
          return field
        }),
        {
          // Computed by validateRedirect; used by the website and by the chain checks.
          name: 'destinationPath',
          label: t('Destino resolvido', 'Resolved destination'),
          type: 'text',
          index: true,
          admin: {
            position: 'sidebar',
            readOnly: true,
            description: t('Vazio quando o destino é externo.', 'Empty for external destinations.'),
          },
        },
        {
          name: 'active',
          label: t('Ativo', 'Active'),
          type: 'checkbox',
          defaultValue: true,
          admin: { position: 'sidebar' },
        },
        {
          name: 'wave',
          label: t('Onda da virada', 'Cutover wave'),
          type: 'select',
          options: [
            { label: t('1: blog', '1: blog'), value: '1' },
            { label: t('2: institucional e ajuda', '2: institutional and help'), value: '2' },
            { label: t('3: produtos', '3: products'), value: '3' },
            { label: t('4: home e restante', '4: home and the rest'), value: '4' },
          ],
          admin: {
            position: 'sidebar',
            description: t('Ver docs/virada.md.', 'See docs/virada.md.'),
          },
        },
        {
          name: 'origin',
          label: t('Criado por', 'Created by'),
          type: 'select',
          defaultValue: 'manual',
          options: [
            { label: t('Manual', 'Manual'), value: 'manual' },
            { label: t('Automático (mudança de URL)', 'Automatic (URL change)'), value: 'auto' },
            { label: t('Importação CSV', 'CSV import'), value: 'import' },
          ],
          admin: { position: 'sidebar', readOnly: true },
        },
      ],
      hooks: {
        beforeValidate: [normalizeRedirectSource],
        beforeChange: [validateRedirect],
        afterChange: [revalidateRedirects],
        afterDelete: [revalidateRedirectsDelete],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      labels: {
        singular: t('Envio de formulário', 'Form submission'),
        plural: t('Envios de formulários', 'Form submissions'),
      },
      admin: { group: t('Formulários', 'Forms') },
      access: {
        // Visitors submit forms; only the tenant's admins and editors read submissions.
        create: anyone,
        read: tenantRoles(['admin', 'editor']),
        update: () => false,
        delete: tenantRoles(['admin']),
      },
      hooks: {
        beforeValidate: [setSubmissionTenant],
      },
    },
    formOverrides: {
      labels: { singular: t('Formulário', 'Form'), plural: t('Formulários', 'Forms') },
      admin: { group: t('Formulários', 'Forms') },
      access: {
        read: anyone,
        create: tenantRoles(['admin', 'editor']),
        update: tenantRoles(['admin', 'editor']),
        delete: tenantRoles(['admin', 'editor']),
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
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
]
