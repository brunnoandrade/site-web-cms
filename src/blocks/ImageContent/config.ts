import type { Block } from 'payload'

import { link } from '../../fields/link'
import { sectionTheme } from '../../fields/sectionTheme'
import { t } from '../../utilities/labels'

export const ImageContent: Block = {
  slug: 'imageContent',
  interfaceName: 'ImageContentBlock',
  labels: {
    singular: t('Imagem com texto', 'Image with text'),
    plural: t('Imagens com texto', 'Images with text'),
  },
  fields: [
    {
      name: 'variant',
      label: t('Estilo', 'Style'),
      type: 'select',
      defaultValue: 'card',
      options: [
        {
          label: t('Cartão arredondado (imagem à esquerda)', 'Rounded card (image on the left)'),
          value: 'card',
        },
        {
          label: t(
            'Seção de largura total (imagem de fundo à esquerda)',
            'Full-width section (background image on the left)',
          ),
          value: 'section',
        },
      ],
    },
    sectionTheme('navy'),
    {
      name: 'image',
      label: t('Imagem', 'Image'),
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imageMobile',
      label: t('Imagem (celular)', 'Image (mobile)'),
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: t(
          'Opcional. Usada em telas com menos de 992px.',
          'Optional. Used under 992px.',
        ),
      },
    },
    {
      name: 'logo',
      label: t('Logo ou ícone acima do título', 'Logo or icon above the title'),
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'eyebrow', label: t('Texto acima do título', 'Text above the title'), type: 'text' },
    {
      name: 'heading',
      label: t('Título', 'Heading'),
      type: 'textarea',
      required: true,
      admin: { description: t('Enter cria uma quebra de linha.', 'Enter adds a line break.') },
    },
    { name: 'text', label: t('Texto', 'Text'), type: 'textarea' },
    {
      name: 'items',
      label: t('Lista com ícones', 'Icon list'),
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'icon', label: t('Ícone', 'Icon'), type: 'upload', relationTo: 'media' },
        { name: 'text', label: t('Texto', 'Text'), type: 'textarea', required: true },
      ],
    },
    { name: 'enableLink', label: t('Com botão', 'With button'), type: 'checkbox' },
    link({
      appearances: false,
      overrides: {
        admin: {
          condition: (_: unknown, siblingData: { enableLink?: boolean }) =>
            Boolean(siblingData?.enableLink),
        },
      },
    }),
    { name: 'legend', label: t('Aviso legal', 'Legal note'), type: 'text' },
  ],
}
