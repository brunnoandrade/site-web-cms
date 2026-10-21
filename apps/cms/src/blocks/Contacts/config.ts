import type { Block } from 'payload'

import { link } from '../../fields/link'
import { t } from '../../utilities/labels'

type Sibling = { enableLink?: boolean }

export const Contacts: Block = {
  slug: 'contacts',
  interfaceName: 'ContactsBlock',
  labels: { singular: t('Contatos', 'Contacts'), plural: t('Contatos', 'Contacts') },
  fields: [
    { name: 'eyebrow', label: t('Texto acima do título', 'Text above the title'), type: 'text' },
    { name: 'heading', label: t('Título', 'Heading'), type: 'text', required: true },
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
          condition: (_: unknown, siblingData: Sibling) => Boolean(siblingData?.enableLink),
        },
      },
    }),
    {
      name: 'groups',
      label: t('Grupos de contato', 'Contact groups'),
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'title',
          label: t('Título do grupo (opcional)', 'Group title (optional)'),
          type: 'text',
        },
        {
          name: 'entries',
          label: t('Contatos', 'Contacts'),
          type: 'array',
          minRows: 1,
          fields: [
            { name: 'title', label: t('Nome', 'Name'), type: 'text', required: true },
            {
              name: 'description',
              label: t('Horário ou detalhe', 'Hours or detail'),
              type: 'text',
            },
            { name: 'phone', label: t('Telefone', 'Phone'), type: 'text' },
            {
              name: 'icon',
              label: t('Ícone (com link)', 'Icon (with link)'),
              type: 'upload',
              relationTo: 'media',
            },
            { name: 'enableLink', label: t('Com link', 'With link'), type: 'checkbox' },
            link({
              appearances: false,
              disableLabel: true,
              overrides: {
                admin: {
                  condition: (_: unknown, siblingData: Sibling) => Boolean(siblingData?.enableLink),
                },
              },
            }),
          ],
        },
      ],
    },
  ],
}
