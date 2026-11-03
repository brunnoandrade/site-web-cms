import type { Block } from 'payload'

import { t } from '../../utilities/labels'

export const RatesTable: Block = {
  slug: 'ratesTable',
  interfaceName: 'RatesTableBlock',
  labels: {
    singular: t('Tabela de taxas', 'Rates table'),
    plural: t('Tabelas de taxas', 'Rates tables'),
  },
  fields: [
    { name: 'heading', label: t('Título da seção', 'Section heading'), type: 'text' },
    {
      name: 'rates',
      label: t('Tabela de taxas', 'Rate table'),
      type: 'relationship',
      relationTo: 'rates',
      required: true,
      admin: {
        description: t(
          'O site mostra a versão publicada da tabela, já validada.',
          'The website shows the published, validated version of the table.',
        ),
      },
    },
  ],
}
