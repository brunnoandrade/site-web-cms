import type { CollectionConfig } from 'payload'

import { anyone, tenantRoles } from '../access/roles'
import { link } from '../fields/link'
import { revalidateTenantContent } from '../hooks/revalidateTenantContent'
import { t } from '../utilities/labels'

const revalidate = revalidateTenantContent(['banners'])

/** Promotional banners, placed on pages through the banner block. */
export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: { singular: t('Banner', 'Banner'), plural: t('Banners', 'Banners') },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: anyone,
    update: tenantRoles(['admin', 'editor']),
  },
  admin: {
    group: t('Conteúdo', 'Content'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'active', 'startsAt', 'endsAt'],
  },
  fields: [
    {
      name: 'title',
      label: t('Título (interno)', 'Title (internal)'),
      type: 'text',
      required: true,
    },
    {
      name: 'alt',
      label: t('Texto alternativo', 'Alternative text'),
      type: 'text',
      required: true,
      admin: {
        description: t(
          'Descreve a imagem para leitores de tela.',
          'Describes the image for screen readers.',
        ),
      },
    },
    {
      name: 'image',
      label: t('Imagem (desktop)', 'Image (desktop)'),
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'mobileImage',
      label: t('Imagem (celular)', 'Image (mobile)'),
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'enableLink', label: t('Com link', 'With link'), type: 'checkbox' },
    link({
      appearances: false,
      overrides: {
        label: t('Link', 'Link'),
        admin: {
          condition: (_: unknown, siblingData: { enableLink?: boolean }) =>
            Boolean(siblingData?.enableLink),
        },
      },
    }),
    {
      name: 'active',
      label: t('Ativo', 'Active'),
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'startsAt',
      label: t('Exibir a partir de', 'Show from'),
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'endsAt',
      label: t('Exibir até', 'Show until'),
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      validate: (value: unknown, { siblingData }: { siblingData: { startsAt?: string } }) =>
        !value ||
        !siblingData?.startsAt ||
        new Date(value as string) > new Date(siblingData.startsAt)
          ? true
          : 'O fim da exibição deve ser depois do início.',
    },
  ],
  hooks: { afterChange: [revalidate.afterChange], afterDelete: [revalidate.afterDelete] },
}
