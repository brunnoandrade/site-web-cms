import type { CollectionConfig } from 'payload'
import { slug } from '../fields/slug'

import { anyone, tenantRoles } from '../access/roles'
import { revalidateTenantContent } from '../hooks/revalidateTenantContent'
import { t } from '../utilities/labels'

const revalidate = revalidateTenantContent(['faqs', 'help'])

/** Questions and answers, reused by the FAQ block and the help center topics. */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: t('Pergunta frequente', 'FAQ'), plural: t('Perguntas frequentes', 'FAQs') },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: anyone,
    update: tenantRoles(['admin', 'editor']),
  },
  admin: {
    group: t('Central de ajuda', 'Help center'),
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'updatedAt'],
  },
  fields: [
    { name: 'question', label: t('Pergunta', 'Question'), type: 'text', required: true },
    // URL in the help center: /central-de-ajuda/<topico>/<slug>/ (see help-topics). Optional in
    // the database: FAQs used only in page blocks do not need one.
    slug({ useAsSlug: 'question', disableUnique: true, required: false }),
    { name: 'answer', label: t('Resposta', 'Answer'), type: 'richText', required: true },
    {
      name: 'category',
      label: t('Categoria da ajuda', 'Help category'),
      type: 'relationship',
      relationTo: 'help-categories',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: { afterChange: [revalidate.afterChange], afterDelete: [revalidate.afterDelete] },
}
