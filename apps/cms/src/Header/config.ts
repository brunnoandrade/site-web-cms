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
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
