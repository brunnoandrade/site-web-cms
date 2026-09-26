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
        { label: t('Destaque com imagem (cards grandes)', 'Feature with image (large cards)'), value: 'feature' },
        { label: t('Produto (imagem e link "Conhecer")', 'Product (image and "Learn more" link)'), value: 'product' },
        { label: t('Ícone com seta (soluções)', 'Icon with arrow (solutions)'), value: 'icon' },
      ],
    },
    sectionTheme(),
    { name: 'heading', label: t('Título da seção', 'Section heading'), type: 'text' },
    { name: 'intro', label: t('Texto de apoio', 'Intro text'), type: 'textarea' },
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
        { name: 'title', label: t('Título', 'Title'), type: 'text', required: true },
        { name: 'text', label: t('Texto', 'Text'), type: 'textarea' },
        { name: 'image', label: t('Imagem', 'Image'), type: 'upload', relationTo: 'media' },
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
          admin: { condition: withVariant('feature') },
        },
        { name: 'enableLink', label: t('Com link', 'With link'), type: 'checkbox' },
        link({
          appearances: false,
          overrides: {
            admin: { condition: (_: unknown, siblingData: Sibling) => Boolean(siblingData?.enableLink) },
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
          condition: (_: unknown, siblingData: { enableSectionLink?: boolean }) => Boolean(siblingData?.enableSectionLink),
        },
      },
    }),
  ],
}
