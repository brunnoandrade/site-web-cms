import type { Block } from 'payload'

import { sectionTheme } from '../../fields/sectionTheme'
import { link } from '../../fields/link'
import { t } from '../../utilities/labels'

export const Steps: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  labels: { singular: t('Passo a passo', 'Steps'), plural: t('Passo a passo', 'Steps') },
  fields: [
    sectionTheme('navy'),
    {
      name: 'heading',
      label: t('Título da seção', 'Section heading'),
      type: 'text',
      required: true,
    },
    { name: 'intro', label: t('Texto de apoio', 'Intro text'), type: 'textarea' },
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
      name: 'items',
      label: t('Passos', 'Steps'),
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', label: t('Título', 'Title'), type: 'text', required: true },
        { name: 'text', label: t('Texto', 'Text'), type: 'textarea' },
        {
          name: 'image',
          label: t('Tela do app', 'App screen'),
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: t(
              'Aparece dentro do celular ao lado da lista quando o passo está aberto (no celular, acima do texto).',
              'Shown inside the phone next to the list while the step is open (above the text on phones).',
            ),
          },
        },
        {
          name: 'imageMobile',
          label: t('Tela do app (celular)', 'App screen (mobile)'),
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: t(
              'Opcional. Usada em telas com menos de 992px.',
              'Optional. Used under 992px.',
            ),
          },
        },
      ],
    },
  ],
}
