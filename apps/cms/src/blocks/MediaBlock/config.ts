import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'mediaMobile',
      label: 'Imagem (celular)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Opcional. Usada em telas com menos de 992px; a imagem ocupa a largura do conteúdo.' },
    },
    {
      name: 'background',
      label: 'Fundo da faixa',
      type: 'select',
      defaultValue: 'white',
      options: [
        { label: 'Branco', value: 'white' },
        { label: 'Cinza claro', value: 'grey' },
      ],
      admin: { description: 'Só para a faixa com imagem de celular (Uber Conta).' },
    },
  ],
}
