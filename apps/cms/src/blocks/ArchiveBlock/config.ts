import type { Block } from 'payload'

import { link } from '../../fields/link'
import { sectionTheme } from '../../fields/sectionTheme'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    sectionTheme(),
    {
      name: 'variant',
      label: 'Estilo',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grade de cards', value: 'grid' },
        { label: 'Carrossel (título à esquerda)', value: 'carousel' },
      ],
    },
    {
      name: 'eyebrow',
      label: 'Texto acima do título',
      type: 'text',
      admin: { condition: (_, siblingData) => siblingData.variant === 'carousel' },
    },
    {
      name: 'feedUrl',
      label: 'Feed do Medium',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.variant === 'carousel',
        description:
          'Opcional. Ex.: https://medium.com/feed/@ubercontabrasil. Com o feed preenchido, os cards mostram os posts mais recentes do Medium (e abrem lá) em vez dos posts do CMS.',
      },
      validate: (value: unknown) => {
        if (!value) return true
        try {
          const url = new URL(String(value))
          return (
            (url.protocol === 'https:' &&
              (url.hostname === 'medium.com' || url.hostname.endsWith('.medium.com'))) ||
            'Use um endereço https do medium.com.'
          )
        } catch {
          return 'URL inválida.'
        }
      },
    },
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: 'Collections To Show',
      options: [
        {
          label: 'Posts',
          value: 'posts',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
      // Posts whose category is one of these.
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['posts'],
    },
    { name: 'enableMoreLink', type: 'checkbox', label: 'Botão "Ir para o blog"' },
    link({
      appearances: false,
      overrides: {
        name: 'moreLink',
        admin: {
          condition: (_: unknown, siblingData: { enableMoreLink?: boolean }) =>
            Boolean(siblingData?.enableMoreLink),
        },
      },
    }),
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}
