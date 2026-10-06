import { t } from '../../utilities/labels'
import { slug } from '../../fields/slug'
import type { CollectionConfig } from 'payload'

import { publishedOrTenantMember, tenantRoles, tenantRolesForVersions } from '../../access/roles'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { BannerSection } from '../../blocks/BannerSection/config'
import { Cards } from '../../blocks/Cards/config'
import { Faq } from '../../blocks/Faq/config'
import { ProductHighlight } from '../../blocks/ProductHighlight/config'
import { RatesTable } from '../../blocks/RatesTable/config'
import { Testimonials } from '../../blocks/Testimonials/config'
import { hero } from '@/heros/config'
import { createRedirectOnUrlChange, rememberPublishedPath } from '../Redirects/hooks'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: t('Página', 'Page'), plural: t('Páginas', 'Pages') },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: publishedOrTenantMember,
    readVersions: tenantRolesForVersions(['admin', 'editor', 'seo']),
    // The SEO role edits meta fields of existing documents.
    update: tenantRoles(['admin', 'editor', 'seo']),
  },
  // Slugs are unique per tenant, not across the whole platform.
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['@/components/LivePreviewRevertSync#LivePreviewRevertSync'],
      },
    },
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          tenant: data?.tenant,
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        tenant: data?.tenant,
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                Content,
                Cards,
                CallToAction,
                MediaBlock,
                ProductHighlight,
                RatesTable,
                Faq,
                Testimonials,
                BannerSection,
                Archive,
                FormBlock,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slug({ disableUnique: true }),
  ],
  hooks: {
    afterChange: [revalidatePage, createRedirectOnUrlChange('pages')],
    beforeChange: [populatePublishedAt, rememberPublishedPath('pages')],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
