import type { Block } from 'payload'

import { link } from '../../fields/link'
import { t } from '../../utilities/labels'

export const Partner: Block = {
  slug: 'partner',
  interfaceName: 'PartnerBlock',
  labels: {
    singular: t('Apresentação com vídeo', 'Presentation with video'),
    plural: t('Apresentações com vídeo', 'Presentations with video'),
  },
  fields: [
    {
      name: 'heading',
      label: t('Título', 'Heading'),
      type: 'textarea',
      required: true,
      admin: {
        description: t(
          'Enter cria uma quebra de linha. Trechos entre **asteriscos duplos** ficam em azul.',
          'Enter adds a line break. Text between **double asterisks** is blue.',
        ),
      },
    },
    {
      name: 'text',
      label: t('Texto', 'Text'),
      type: 'textarea',
      admin: {
        description: t('Linha em branco separa parágrafos.', 'A blank line separates paragraphs.'),
      },
    },
    { name: 'enableLink', label: t('Com botão', 'With button'), type: 'checkbox' },
    link({
      appearances: false,
      overrides: {
        admin: {
          condition: (_: unknown, siblingData: { enableLink?: boolean }) =>
            Boolean(siblingData?.enableLink),
        },
      },
    }),
    {
      name: 'video',
      label: t('Vídeo de fundo (computador)', 'Background video (desktop)'),
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['video/mp4', 'video/webm'] } },
    },
    {
      name: 'videoMobile',
      label: t('Vídeo de fundo (celular)', 'Background video (mobile)'),
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['video/mp4', 'video/webm'] } },
    },
  ],
}
