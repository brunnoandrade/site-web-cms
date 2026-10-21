import type { Block } from 'payload'

import { iconField } from '../../fields/icon'
import { link } from '../../fields/link'
import { sectionTheme } from '../../fields/sectionTheme'
import { t } from '../../utilities/labels'

type Sibling = { enableLink?: boolean }
type BlockData = { variant?: string }

const withVariant =
  (...variants: string[]) =>
  (data: unknown, _sibling: unknown, { blockData }: { blockData?: BlockData }) =>
    variants.includes(blockData?.variant ?? 'simple')

export const Cards: Block = {
  slug: 'cards',
  interfaceName: 'CardsBlock',
  labels: { singular: t('Cards', 'Cards'), plural: t('Cards', 'Cards') },
  fields: [
    {
      name: 'variant',
      label: t('Estilo', 'Style'),
      type: 'select',
      defaultValue: 'simple',
      options: [
        { label: t('Simples', 'Simple'), value: 'simple' },
        {
          label: t('Destaque com imagem (cards grandes)', 'Feature with image (large cards)'),
          value: 'feature',
        },
        {
          label: t('Produto (imagem e link "Conhecer")', 'Product (image and "Learn more" link)'),
          value: 'product',
        },
        { label: t('Ícone com seta (soluções)', 'Icon with arrow (solutions)'), value: 'icon' },
        {
          label: t(
            'Benefícios (imagem ao lado e cards com ícone)',
            'Benefits (side image and icon cards)',
          ),
          value: 'benefits',
        },
        {
          label: t(
            'Atalhos (imagem de fundo e seta ao passar o mouse)',
            'Shortcuts (background image, arrow on hover)',
          ),
          value: 'shortcut',
        },
      ],
    },
    sectionTheme(),
    { name: 'heading', label: t('Título da seção', 'Section heading'), type: 'text' },
    { name: 'intro', label: t('Texto de apoio', 'Intro text'), type: 'textarea' },
    {
      name: 'video',
      label: t('Vídeo de fundo', 'Background video'),
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['video/mp4', 'video/webm'] } },
      admin: {
        condition: withVariant('icon', 'benefits'),
        description: t(
          'Opcional. Toca em loop, sem som: atrás do título (soluções) ou no lugar da imagem ao lado (benefícios).',
          'Optional. Loops silently: behind the heading (solutions) or instead of the side image (benefits).',
        ),
      },
    },
    {
      name: 'image',
      label: t('Imagem ao lado', 'Side image'),
      type: 'upload',
      relationTo: 'media',
      admin: { condition: withVariant('benefits') },
    },
    {
      name: 'backgroundImage',
      label: t('Imagem de fundo do topo', 'Top background image'),
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: withVariant('icon'),
        description: t(
          'Opcional. Imagem atrás do título (o vídeo, quando houver, tem prioridade).',
          'Optional. Image behind the heading (a video, when set, takes precedence).',
        ),
      },
    },
    {
      name: 'backgroundImageMobile',
      label: t('Imagem de fundo do topo (celular)', 'Top background image (mobile)'),
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: withVariant('icon'),
        description: t(
          'Opcional. Usada em telas com menos de 992px (em geral vertical); sem ela vale a imagem principal.',
          'Optional. Used under 992px (usually portrait); without it the main image is used.',
        ),
      },
    },
    {
      name: 'legend',
      label: t('Aviso legal', 'Legal note'),
      type: 'text',
      admin: { condition: withVariant('icon') },
    },
    {
      name: 'listHeading',
      label: t('Subtítulo da lista', 'List subheading'),
      type: 'text',
      admin: { condition: withVariant('icon') },
    },
    {
      name: 'columns',
      label: t('Colunas', 'Columns'),
      type: 'select',
      defaultValue: '3',
      options: ['2', '3', '4'].map((value) => ({ label: value, value })),
    },
    {
      name: 'items',
      label: t('Cards', 'Cards'),
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'title',
          label: t('Título', 'Title'),
          type: 'textarea',
          required: true,
          admin: {
            rows: 2,
            description: t(
              'Enter cria uma quebra de linha (aparece em telas a partir de 768px; no celular o texto corre numa linha só).',
              'Enter adds a line break (shown from 768px; on phones the text runs on one line).',
            ),
          },
        },
        {
          name: 'text',
          label: t('Texto', 'Text'),
          type: 'textarea',
          admin: {
            description: t(
              'Enter cria uma quebra de linha (aparece em telas a partir de 992px).',
              'Enter adds a line break (shown from 992px).',
            ),
          },
        },
        { name: 'image', label: t('Imagem', 'Image'), type: 'upload', relationTo: 'media' },
        {
          name: 'imageMobile',
          label: t('Imagem (celular)', 'Image (mobile)'),
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: withVariant('shortcut'),
            description: t(
              'Opcional. Usada em telas com menos de 768px; sem ela, vale a imagem principal.',
              'Optional. Used under 768px; without it the main image is used.',
            ),
          },
        },
        iconField({ admin: { condition: withVariant('icon') } } as never),
        {
          name: 'background',
          label: t('Cor do card', 'Card color'),
          type: 'select',
          defaultValue: 'navy',
          options: [
            { label: t('Azul-marinho', 'Navy'), value: 'navy' },
            { label: t('Azul', 'Blue'), value: 'blue' },
            { label: t('Lilás claro', 'Light lilac'), value: 'lilac' },
            { label: t('Branco', 'White'), value: 'white' },
          ],
          admin: { condition: withVariant('feature', 'shortcut') },
        },
        { name: 'enableLink', label: t('Com link', 'With link'), type: 'checkbox' },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_: unknown, siblingData: Sibling) => Boolean(siblingData?.enableLink),
            },
          },
        }),
      ],
    },
    {
      name: 'enableSectionLink',
      label: t('Botão da seção (ex.: "Ver todas as soluções")', 'Section button (e.g. "See all")'),
      type: 'checkbox',
    },
    link({
      appearances: false,
      overrides: {
        name: 'sectionLink',
        admin: {
          condition: (_: unknown, siblingData: { enableSectionLink?: boolean }) =>
            Boolean(siblingData?.enableSectionLink),
        },
      },
    }),
  ],
}
