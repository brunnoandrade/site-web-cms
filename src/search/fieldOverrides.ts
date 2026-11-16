import { Field } from 'payload'

import { t } from '@/utilities/labels'

const labels: Record<string, ReturnType<typeof t>> = {
  title: t('Título', 'Title'),
  priority: t('Prioridade', 'Priority'),
  doc: t('Post', 'Post'),
  docUrl: t('Endereço', 'URL'),
}

/** The plugin's own fields come with labels derived from their names (English): label them. */
export const labelSearchField = (field: Field): Field =>
  'name' in field && field.name && labels[field.name] ? { ...field, label: labels[field.name] } : field

export const searchFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    index: true,
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'meta',
    label: t('SEO', 'SEO'),
    type: 'group',
    index: true,
    admin: {
      readOnly: true,
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: t('Título', 'Title'),
      },
      {
        type: 'text',
        name: 'description',
        label: t('Descrição', 'Description'),
      },
      {
        name: 'image',
        label: t('Imagem', 'Image'),
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
  {
    label: t('Categorias', 'Categories'),
    name: 'categories',
    type: 'array',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'relationTo',
        type: 'text',
      },
      {
        name: 'categoryID',
        type: 'text',
      },
      {
        name: 'title',
        type: 'text',
      },
    ],
  },
]
