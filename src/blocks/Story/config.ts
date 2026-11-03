import type { Block } from 'payload'

import { t } from '../../utilities/labels'

export const Story: Block = {
  slug: 'story',
  interfaceName: 'StoryBlock',
  labels: {
    singular: t('Foto com destaques', 'Photo with highlights'),
    plural: t('Fotos com destaques', 'Photos with highlights'),
  },
  fields: [
    {
      name: 'image',
      label: t('Foto', 'Photo'),
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imageMobile',
      label: t('Foto (celular)', 'Photo (mobile)'),
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: t(
          'Opcional. Usada em telas com menos de 992px.',
          'Optional. Used under 992px.',
        ),
      },
    },
    {
      name: 'heading',
      label: t('Título', 'Heading'),
      type: 'textarea',
      required: true,
      admin: { description: t('Enter cria uma quebra de linha.', 'Enter adds a line break.') },
    },
    { name: 'text', label: t('Texto', 'Text'), type: 'textarea' },
    {
      name: 'items',
      label: t('Destaques', 'Highlights'),
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'icon', label: t('Ícone', 'Icon'), type: 'upload', relationTo: 'media' },
        { name: 'title', label: t('Título', 'Title'), type: 'text', required: true },
        { name: 'text', label: t('Texto', 'Text'), type: 'text' },
      ],
    },
  ],
}
