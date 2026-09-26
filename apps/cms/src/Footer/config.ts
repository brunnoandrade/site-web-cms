import type { CollectionConfig } from 'payload'

import { anyone, tenantRoles } from '@/access/roles'
import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

/**
 * One footer per tenant: a collection handled as a global by the multi-tenant plugin
 * (`isGlobal`), since Payload globals cannot be scoped to a tenant.
 */
export const Footer: CollectionConfig = {
  slug: 'footer',
  labels: { singular: 'Rodapé', plural: 'Rodapé' },
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
      // Link columns (e.g. "Conta digital", "Empréstimos", "Institucional").
      name: 'columns',
      label: 'Colunas de links',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'title', label: 'Título da coluna', type: 'text', required: true },
        {
          name: 'links',
          label: 'Links',
          type: 'array',
          maxRows: 10,
          fields: [link({ appearances: false })],
        },
      ],
    },
    {
      name: 'legalText',
      label: 'Texto legal (razão social, CNPJ etc.)',
      type: 'textarea',
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
