import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          // Digio design system: dark full-width hero with image, CTAs and legal note.
          label: 'Digio (fundo escuro)',
          value: 'brand',
        },
        {
          // Uber Conta design: full-screen black hero with a background video, one CTA and a legal note.
          label: 'Tela cheia com vídeo',
          value: 'fullscreen',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
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
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['brand', 'fullscreen', 'highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'video',
      label: 'Vídeo de fundo (computador)',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['video/mp4', 'video/webm'] } },
      admin: {
        condition: (_, { type } = {}) => type === 'fullscreen',
        description:
          'Opcional. Com vídeo, a imagem acima não aparece (o fundo fica preto até o vídeo carregar, para não piscar outra imagem). Sem vídeo, ela é o fundo do hero.',
      },
    },
    {
      name: 'videoMobile',
      label: 'Vídeo de fundo (celular)',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['video/mp4', 'video/webm'] } },
      admin: {
        condition: (_, { type } = {}) => type === 'fullscreen',
        description:
          'Opcional. Usado em telas com menos de 768px (em geral um vídeo vertical). Sem ele, o celular usa o vídeo do computador.',
      },
    },
    {
      name: 'disclaimer',
      label: 'Aviso legal (texto pequeno abaixo das chamadas)',
      type: 'textarea',
      admin: {
        condition: (_, { type } = {}) => ['brand', 'fullscreen'].includes(type),
      },
    },
    link({
      appearances: false,
      overrides: {
        name: 'disclaimerLink',
        label: 'Link no aviso legal (ex.: "Saber mais.")',
        admin: {
          condition: (_: unknown, siblingData: { type?: string }) =>
            ['brand', 'fullscreen'].includes(siblingData?.type ?? ''),
        },
      },
    }),
  ],
  label: false,
}
