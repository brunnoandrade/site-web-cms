import type { Block } from 'payload'

import { link } from '../../fields/link'
import { t } from '../../utilities/labels'

export const Documents: Block = {
  slug: 'documents',
  interfaceName: 'DocumentsBlock',
  labels: {
    singular: t('Lista de documentos', 'Document list'),
    plural: t('Listas de documentos', 'Document lists'),
  },
  fields: [
    {
      name: 'groups',
      label: t('Grupos', 'Groups'),
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', label: t('Título do grupo', 'Group title'), type: 'text', required: true },
        {
          name: 'items',
          label: t('Documentos', 'Documents'),
          type: 'array',
          minRows: 1,
          fields: [
            { name: 'title', label: t('Nome', 'Name'), type: 'text', required: true },
            { name: 'icon', label: t('Ícone', 'Icon'), type: 'upload', relationTo: 'media' },
            {
              name: 'links',
              label: t('Links', 'Links'),
              type: 'array',
              minRows: 1,
              maxRows: 4,
              admin: {
                description: t(
                  'Um link abre direto ("Acessar"); mais de um abre um menu com os rótulos de cada link.',
                  'One link opens directly ("Access"); more than one opens a menu with each link label.',
                ),
              },
              fields: [link({ appearances: false })],
            },
          ],
        },
      ],
    },
  ],
}
