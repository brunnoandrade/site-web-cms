import { t } from '../utilities/labels'
import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone, tenantRoles } from '../access/roles'
import { setTenantPrefix } from '../hooks/setTenantPrefix'
import { wpIdField } from '../fields/wpId'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: t('Mídia', 'Media'), plural: t('Mídias', 'Media') },
  folders: true,
  access: {
    create: tenantRoles(['admin', 'editor', 'seo']),
    delete: tenantRoles(['admin', 'editor']),
    read: anyone,
    update: tenantRoles(['admin', 'editor', 'seo']),
  },
  hooks: {
    beforeValidate: [setTenantPrefix],
  },
  fields: [
    {
      // Managed by the setTenantPrefix hook; merged into the storage plugin's prefix field.
      name: 'prefix',
      type: 'text',
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    wpIdField,
    {
      // Original URL in WordPress: the migration reuses the file instead of uploading it again.
      name: 'wpSourceUrl',
      type: 'text',
      index: true,
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
  ],
  upload: {
    // Allowlist: files are served from the public bucket, so formats that can carry script
    // (SVG, HTML, XML) are refused. The size limit is set in payload.config.ts.
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'application/pdf',
    ],
    // Local fallback dir; in practice files are stored in S3/MinIO by @payloadcms/storage-s3
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
