import type { Block } from 'payload'

import { t } from '../../utilities/labels'

export const ProductHighlight: Block = {
  slug: 'productHighlight',
  interfaceName: 'ProductHighlightBlock',
  labels: {
    singular: t('Destaque de produto', 'Product highlight'),
    plural: t('Destaques de produto', 'Product highlights'),
  },
  fields: [
    {
      name: 'product',
      label: t('Produto', 'Product'),
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'imagePosition',
      label: t('Posição da imagem', 'Image position'),
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: t('Direita', 'Right'), value: 'right' },
        { label: t('Esquerda', 'Left'), value: 'left' },
      ],
    },
  ],
}
