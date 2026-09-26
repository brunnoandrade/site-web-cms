import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { publishedOrTenantMember, tenantRoles } from '../../access/roles'
import { revalidateTenantContent } from '../../hooks/revalidateTenantContent'
import { t } from '../../utilities/labels'
import { validateRates, type RatesInput } from './validateRates'

const revalidate = revalidateTenantContent(['rates'])

/** Business validation runs when publishing; drafts can be saved incomplete. */
const validateBeforePublish: CollectionBeforeChangeHook = ({ collection, data, req }) => {
  if (data._status !== 'published') return data

  const errors = validateRates(data as RatesInput)
  if (errors.length > 0) {
    throw new ValidationError({ collection: collection.slug, errors }, req.t)
  }
  return data
}

/** Interest rates, CET and fees of a product, with validity dates. */
export const Rates: CollectionConfig = {
  slug: 'rates',
  labels: {
    singular: t('Tabela de taxas', 'Rate table'),
    plural: t('Taxas e CET', 'Rates and CET'),
  },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: publishedOrTenantMember,
    readVersions: tenantRoles(['admin', 'editor']),
    update: tenantRoles(['admin', 'editor']),
  },
  admin: {
    group: t('Produtos e taxas', 'Products and rates'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', 'validFrom', '_status'],
    description: t(
      'As regras de negócio (CET, coerência mensal/anual, vigência e nota legal) são validadas ao publicar.',
      'Business rules (CET, monthly/yearly consistency, validity and legal note) are checked on publish.',
    ),
  },
  fields: [
    { name: 'title', label: t('Título', 'Title'), type: 'text', required: true },
    {
      name: 'product',
      label: t('Produto', 'Product'),
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'validFrom',
          label: t('Vigência: início', 'Valid from'),
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
        },
        {
          name: 'validUntil',
          label: t('Vigência: fim', 'Valid until'),
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
        },
      ],
    },
    {
      name: 'items',
      label: t('Taxas', 'Rates'),
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'label', label: t('Descrição', 'Label'), type: 'text', required: true },
        {
          type: 'row',
          fields: [
            {
              name: 'kind',
              label: t('Tipo', 'Kind'),
              type: 'select',
              required: true,
              options: [
                { label: t('Juros', 'Interest'), value: 'interest' },
                { label: 'CET', value: 'cet' },
                { label: t('Tarifa', 'Fee'), value: 'fee' },
                { label: t('Outro', 'Other'), value: 'other' },
              ],
            },
            {
              name: 'period',
              label: t('Período', 'Period'),
              type: 'select',
              required: true,
              options: [
                { label: t('Ao mês', 'Monthly'), value: 'monthly' },
                { label: t('Ao ano', 'Yearly'), value: 'yearly' },
                { label: t('Única', 'One-off'), value: 'once' },
              ],
            },
            {
              name: 'valueType',
              label: t('Unidade', 'Unit'),
              type: 'select',
              required: true,
              defaultValue: 'percent',
              options: [
                { label: '%', value: 'percent' },
                { label: 'R$', value: 'currency' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              label: t('Valor (a partir de)', 'Value (from)'),
              type: 'number',
              required: true,
              min: 0,
            },
            {
              name: 'valueMax',
              label: t('Valor máximo (opcional)', 'Maximum value (optional)'),
              type: 'number',
              min: 0,
            },
          ],
        },
      ],
    },
    {
      name: 'legalNote',
      label: t('Nota legal', 'Legal note'),
      type: 'textarea',
      admin: { description: t('Obrigatória para publicar.', 'Required to publish.') },
    },
  ],
  hooks: {
    beforeChange: [validateBeforePublish],
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
  versions: {
    drafts: { schedulePublish: true },
    maxPerDoc: 50,
  },
}
