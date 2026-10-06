import { t } from '../../utilities/labels'
import { slug } from '../../fields/slug'
import type { CollectionConfig } from 'payload'

import {
  BlockquoteFeature,
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  StrikethroughFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

import { publishedOrTenantMember, tenantRoles, tenantRolesForVersions } from '../../access/roles'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { wpIdField } from '../../fields/wpId'
import { createRedirectOnUrlChange, rememberPublishedPath } from '../Redirects/hooks'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: { singular: t('Post', 'Post'), plural: t('Posts', 'Posts') },
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
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    category: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['@/components/LivePreviewRevertSync#LivePreviewRevertSync'],
      },
    },
    group: t('Blog', 'Blog'),
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          category: data?.category,
          tenant: data?.tenant,
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        category: data?.category,
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
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    // The migrated blog uses all of these; without a feature, the HTML
                    // converter silently drops that content (see src/wordpress/contentCheck.ts).
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
                    UnorderedListFeature(),
                    OrderedListFeature(),
                    BlockquoteFeature(),
                    StrikethroughFeature(),
                    UploadFeature({ collections: { media: { fields: [] } } }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                    // Tables are common in the current blog (rates, comparisons). Marked
                    // experimental by Payload; the website renders them (RichText converters).
                    EXPERIMENTAL_TableFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              // Defines the post URL: /blog/<categoria>/<slug>/ (same as WordPress).
              name: 'category',
              label: t('Categoria', 'Category'),
              type: 'relationship',
              required: true,
              admin: {
                position: 'sidebar',
                description: t(
                  'Define o endereço do post: /blog/<categoria>/<slug>/. Trocar a categoria de um post publicado cria o redirect automaticamente.',
                  'Defines the post URL: /blog/<category>/<slug>/. Changing the category of a published post creates the redirect automatically.',
                ),
              },
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
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
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      // Public author profiles (not admin users).
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'authors',
    },
    slug({ disableUnique: true }),
    wpIdField,
    {
      // Last modification in WordPress: the migration skips posts that did not change.
      name: 'wpModifiedAt',
      type: 'date',
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
  ],
  hooks: {
    afterChange: [revalidatePost, createRedirectOnUrlChange('posts')],
    beforeChange: [rememberPublishedPath('posts')],
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
