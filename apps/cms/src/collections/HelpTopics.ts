import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { slug } from '../fields/slug'
import { ValidationError } from 'payload'

import { publishedOrTenantMember, tenantRoles } from '../access/roles'
import { revalidateTenantContent } from '../hooks/revalidateTenantContent'
import { t } from '../utilities/labels'

const revalidate = revalidateTenantContent(['help'])

/**
 * Each question of a topic has its own page (/central-de-ajuda/<topico>/<pergunta>/): questions
 * need a slug, unique within the topic.
 */
const validateQuestionSlugs: CollectionBeforeChangeHook = async ({ collection, data, req }) => {
  const ids = ((data.faqs ?? []) as unknown[])
    .map((faq) => (faq && typeof faq === 'object' ? (faq as { id: number }).id : faq))
    .filter((id): id is number => typeof id === 'number')
  if (ids.length === 0) return data

  const { docs } = await req.payload.find({
    collection: 'faqs',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    req,
    where: { id: { in: ids } },
    select: { question: true, slug: true },
  })

  const errors: { path: string; message: string }[] = []
  const seen = new Map<string, string>()
  for (const faq of docs) {
    if (!faq.slug) {
      errors.push({
        path: 'faqs',
        message: `A pergunta "${faq.question}" não tem slug (endereço).`,
      })
    } else if (seen.has(faq.slug)) {
      errors.push({
        path: 'faqs',
        message: `As perguntas "${seen.get(faq.slug)}" e "${faq.question}" têm o mesmo slug (${faq.slug}).`,
      })
    } else {
      seen.set(faq.slug, faq.question)
    }
  }

  if (errors.length > 0) throw new ValidationError({ collection: collection.slug, errors }, req.t)
  return data
}

/** Help center topics (~29), grouped by category. */
export const HelpTopics: CollectionConfig = {
  slug: 'help-topics',
  labels: {
    singular: t('Tópico da ajuda', 'Help topic'),
    plural: t('Tópicos da ajuda', 'Help topics'),
  },
  access: {
    create: tenantRoles(['admin', 'editor']),
    delete: tenantRoles(['admin', 'editor']),
    read: publishedOrTenantMember,
    readVersions: tenantRoles(['admin', 'editor', 'seo']),
    update: tenantRoles(['admin', 'editor', 'seo']),
  },
  admin: {
    group: t('Central de ajuda', 'Help center'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'updatedAt'],
  },
  defaultSort: 'order',
  indexes: [{ fields: ['tenant', 'slug'], unique: true }],
  fields: [
    { name: 'title', label: t('Título', 'Title'), type: 'text', required: true },
    slug({ disableUnique: true }),
    {
      name: 'category',
      label: t('Categoria', 'Category'),
      type: 'relationship',
      relationTo: 'help-categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      label: t('Ordem na categoria', 'Order in category'),
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    { name: 'summary', label: t('Resumo', 'Summary'), type: 'textarea' },
    { name: 'content', label: t('Conteúdo', 'Content'), type: 'richText' },
    {
      // Ordered list of the topic's questions. Each one gets its page at
      // /central-de-ajuda/<topico>/<pergunta>/.
      name: 'faqs',
      label: t('Perguntas (em ordem)', 'Questions (in order)'),
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
    },
  ],
  hooks: {
    beforeChange: [validateQuestionSlugs],
    afterChange: [revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
  versions: {
    drafts: { schedulePublish: true },
    maxPerDoc: 50,
  },
}
