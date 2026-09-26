import type { CollectionConfig } from 'payload'
import { slug } from '../fields/slug'

import { anyone, tenantRoles } from '../access/roles'
import { link } from '../fields/link'
import { revalidateTenantContent } from '../hooks/revalidateTenantContent'
import { t } from '../utilities/labels'

const revalidate = revalidateTenantContent(['products'])

/** Product data reused by pages (product highlight and rates table blocks). */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: t('Produto', 'Product'), plural: t('Produtos', 'Products') },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: anyone,
    update: tenantRoles(['admin', 'editor']),
  },
  admin: {
    group: t('Produtos e taxas', 'Products and rates'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'updatedAt'],
  },
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'name', label: t('Nome', 'Name'), type: 'text', required: true },
    slug({ useAsSlug: 'name', disableUnique: true }),
    {
      name: 'category',
      label: t('Categoria', 'Category'),
      type: 'select',
      required: true,
      options: [
        { label: t('Cartão de crédito', 'Credit card'), value: 'credit-card' },
        { label: t('Conta digital', 'Digital account'), value: 'account' },
        { label: t('Empréstimo', 'Loan'), value: 'loan' },
        { label: t('Investimento', 'Investment'), value: 'investment' },
        { label: t('Seguro', 'Insurance'), value: 'insurance' },
        { label: t('Outro', 'Other'), value: 'other' },
      ],
    },
    {
      name: 'summary',
      label: t('Resumo', 'Summary'),
      type: 'textarea',
      required: true,
      maxLength: 280,
      admin: {
        description: t(
          'Até 280 caracteres. Usado nos destaques.',
          'Up to 280 characters. Used in highlights.',
        ),
      },
    },
    { name: 'image', label: t('Imagem', 'Image'), type: 'upload', relationTo: 'media' },
    {
      name: 'benefits',
      label: t('Benefícios', 'Benefits'),
      type: 'array',
      maxRows: 6,
      fields: [{ name: 'text', label: t('Benefício', 'Benefit'), type: 'text', required: true }],
    },
    { name: 'enableLink', label: t('Com chamada (CTA)', 'With call to action'), type: 'checkbox' },
    link({
      appearances: false,
      overrides: {
        label: t('Chamada (CTA)', 'Call to action'),
        admin: {
          condition: (_: unknown, siblingData: { enableLink?: boolean }) =>
            Boolean(siblingData?.enableLink),
        },
      },
    }),
  ],
  hooks: { afterChange: [revalidate.afterChange], afterDelete: [revalidate.afterDelete] },
}
