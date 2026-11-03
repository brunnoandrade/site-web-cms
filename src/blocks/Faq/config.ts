import type { Block } from 'payload'

import { link } from '../../fields/link'
import { sectionTheme } from '../../fields/sectionTheme'
import { t } from '../../utilities/labels'

export const Faq: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: t('Perguntas frequentes', 'FAQ'), plural: t('Perguntas frequentes', 'FAQs') },
  fields: [
    sectionTheme(),
    {
      name: 'variant',
      label: t('Estilo', 'Style'),
      type: 'select',
      defaultValue: 'list',
      options: [
        { label: t('Lista com divisórias', 'List with dividers'), value: 'list' },
        {
          label: t('Cards (uma aberta por vez, a primeira aberta)', 'Cards (one open at a time, first open)'),
          value: 'cards',
        },
      ],
    },
    { name: 'heading', label: t('Título da seção', 'Section heading'), type: 'text' },
    {
      name: 'faqs',
      label: t('Perguntas', 'Questions'),
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      required: true,
      minRows: 1,
    },
    { name: 'enableMoreLink', label: t('Link "Outras dúvidas"', '"More questions" link'), type: 'checkbox' },
    link({
      appearances: false,
      overrides: {
        name: 'moreLink',
        admin: {
          condition: (_: unknown, siblingData: { enableMoreLink?: boolean }) => Boolean(siblingData?.enableMoreLink),
        },
      },
    }),
  ],
}
