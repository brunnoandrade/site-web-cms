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
          // Uber Conta product pages: full-bleed cover image (desktop and mobile), tagline, title, text and one CTA.
          label: 'Imagem de capa (páginas de produto)',
          value: 'cover',
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
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h6'] }),
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
        condition: (_, { type } = {}) =>
          ['brand', 'fullscreen', 'cover', 'highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tone',
      label: 'Cor do texto',
      type: 'select',
      defaultValue: 'onDark',
      options: [
        { label: 'Texto branco (imagem escura)', value: 'onDark' },
        { label: 'Texto preto (imagem clara)', value: 'onLight' },
      ],
      admin: { condition: (_, { type } = {}) => type === 'cover' },
    },
    {
      name: 'size',
      label: 'Altura',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Tela cheia', value: 'full' },
        { label: 'Meia altura, texto centralizado (central de ajuda, blog)', value: 'half' },
      ],
      admin: { condition: (_, { type } = {}) => type === 'cover' },
    },
    {
      name: 'searchPlaceholder',
      label: 'Campo de busca da central de ajuda (texto de apoio)',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'cover',
        description:
          'Opcional. Preenchido, mostra a caixa de busca na base do hero; a busca leva a /central-de-ajuda/busca/.',
      },
    },
    {
      name: 'logo',
      label: 'Logo acima do título',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, { type } = {}) => type === 'cover' },
    },
    {
      name: 'mediaMobile',
      label: 'Imagem (celular)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, { type } = {}) => type === 'cover',
        description: 'Usada em telas com menos de 992px; sem ela, vale a imagem principal.',
      },
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
        condition: (_, { type } = {}) => ['brand', 'fullscreen', 'cover'].includes(type),
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
