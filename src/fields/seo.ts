import type { Tab, UploadField } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { t } from '@/utilities/labels'

// The plugin's `overrides` replace `admin` as a whole (its generate button included): keep it and
// only swap the description.
const pluginImage = MetaImageField({ relationTo: 'media', hasGenerateFn: true }) as UploadField
const metaImage = {
  ...pluginImage,
  admin: {
    ...pluginImage.admin,
    description: t(
      'Imagem do compartilhamento (WhatsApp, LinkedIn, Facebook, X) e do Google. Ideal: 1200×630. Vazia, o site usa a imagem de destaque ou do hero do documento, depois a padrão da propriedade.',
      'Share image (WhatsApp, LinkedIn, Facebook, X) and Google. Ideal: 1200×630. Empty, the site uses the document’s featured or hero image, then the property default.',
    ),
  },
} as UploadField

/**
 * SEO tab of pages and posts. Every field has the plugin's "generate" button (title, description
 * and image, see `src/plugins/index.ts`); left empty, the website falls back to the document's own
 * title, text and image (`src/utilities/seo.ts`), so a published document never goes out bare.
 */
export const seoTab: Tab = {
  name: 'meta',
  label: 'SEO',
  fields: [
    OverviewField({
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
      imagePath: 'meta.image',
    }),
    MetaTitleField({ hasGenerateFn: true }),
    MetaDescriptionField({ hasGenerateFn: true }),
    metaImage,
    {
      name: 'keywords',
      label: 'Palavras-chave',
      type: 'text',
      admin: { description: 'Separadas por vírgula (meta keywords).' },
    },
    {
      name: 'sharePreview',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/SharePreview#SharePreview' } },
    },
    PreviewField({
      hasGenerateFn: true,
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
    }),
  ],
}
