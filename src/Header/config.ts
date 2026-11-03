import type { CollectionConfig } from 'payload'

import { anyone, tenantRoles } from '@/access/roles'
import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

/**
 * One header per tenant: a collection handled as a global by the multi-tenant plugin
 * (`isGlobal`), since Payload globals cannot be scoped to a tenant.
 */
export const Header: CollectionConfig = {
  slug: 'header',
  labels: { singular: 'Cabeçalho', plural: 'Cabeçalho' },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin']),
    read: anyone,
    update: tenantRoles(['admin', 'editor']),
  },
  admin: {
    group: 'Layout',
  },
  fields: [
    {
      name: 'enableCta',
      label: 'Botão em destaque (ex.: "Abrir conta")',
      type: 'checkbox',
    },
    link({
      appearances: false,
      overrides: {
        name: 'cta',
        admin: { condition: (_: unknown, siblingData: { enableCta?: boolean }) => Boolean(siblingData?.enableCta) },
      },
    }),
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Opcional. Sem logo, o layout usa a marca padrão da propriedade.' },
    },
    {
      // A plain link, or a mega menu: a panel with a title, a description and columns of links.
      name: 'navItems',
      label: 'Itens do menu',
      type: 'array',
      maxRows: 8,
      fields: [
        {
          name: 'kind',
          label: 'Tipo',
          type: 'radio',
          defaultValue: 'link',
          admin: { layout: 'horizontal' },
          options: [
            { label: 'Link simples', value: 'link' },
            { label: 'Mega menu', value: 'mega' },
          ],
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              hideGutter: true,
              condition: (_: unknown, siblingData: { kind?: string }) => siblingData?.kind !== 'mega',
            },
          },
        }),
        {
          name: 'mega',
          label: 'Mega menu',
          type: 'group',
          admin: { condition: (_: unknown, siblingData: { kind?: string }) => siblingData?.kind === 'mega' },
          fields: [
            { name: 'label', label: 'Rótulo no menu (ex.: Pra você)', type: 'text', required: true },
            { name: 'title', label: 'Título do painel', type: 'text' },
            { name: 'description', label: 'Descrição do painel', type: 'textarea' },
            {
              name: 'groups',
              label: 'Colunas',
              type: 'array',
              maxRows: 8,
              fields: [
                { name: 'label', label: 'Título da coluna (opcional, ex.: Conta digital)', type: 'text' },
                {
                  name: 'links',
                  label: 'Links',
                  type: 'array',
                  maxRows: 10,
                  fields: [link({ appearances: false })],
                },
              ],
            },
          ],
        },
      ],
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
