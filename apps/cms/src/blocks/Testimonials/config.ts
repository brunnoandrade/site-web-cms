import type { Block } from 'payload'

import { sectionTheme } from '../../fields/sectionTheme'
import { t } from '../../utilities/labels'

export const Testimonials: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: t('Depoimentos', 'Testimonials'), plural: t('Depoimentos', 'Testimonials') },
  fields: [
    sectionTheme('blue'),
    { name: 'heading', label: t('Título da seção', 'Section heading'), type: 'text', required: true },
    {
      name: 'items',
      label: t('Depoimentos', 'Testimonials'),
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'quote',
          label: t('Depoimento', 'Quote'),
          type: 'textarea',
          required: true,
          admin: {
            description: t(
              'Use depoimentos reais, com autorização. Trechos entre **asteriscos duplos** aparecem em destaque.',
              'Use real, authorized testimonials. Text between **double asterisks** is highlighted.',
            ),
          },
        },
        { name: 'author', label: t('Nome', 'Name'), type: 'text', required: true },
        { name: 'detail', label: t('Complemento (ex.: cliente desde 2020)', 'Detail (e.g. customer since 2020)'), type: 'text' },
      ],
    },
  ],
}
