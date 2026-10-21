import type { Block } from 'payload'

import { t } from '../../utilities/labels'

export const Timeline: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  labels: { singular: t('Linha do tempo', 'Timeline'), plural: t('Linhas do tempo', 'Timelines') },
  fields: [
    {
      name: 'heading',
      label: t('Título', 'Heading'),
      type: 'textarea',
      required: true,
      admin: { description: t('Enter cria uma quebra de linha.', 'Enter adds a line break.') },
    },
    {
      name: 'text',
      label: t('Texto', 'Text'),
      type: 'textarea',
      admin: {
        description: t('Linha em branco separa parágrafos.', 'A blank line separates paragraphs.'),
      },
    },
    {
      name: 'items',
      label: t('Marcos', 'Milestones'),
      type: 'array',
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: 'icon', label: t('Ícone', 'Icon'), type: 'upload', relationTo: 'media' },
        {
          name: 'period',
          label: t('Data (ex.: 2021)', 'Date (e.g. 2021)'),
          type: 'text',
          required: true,
        },
        { name: 'title', label: t('Título', 'Title'), type: 'text', required: true },
        { name: 'text', label: t('Texto', 'Text'), type: 'textarea' },
      ],
    },
  ],
}
