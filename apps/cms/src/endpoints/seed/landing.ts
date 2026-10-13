import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@digio/payload-types'

import { custom, richText } from './home'

/**
 * Example campaign landing page: "landing" template (no menu or footer), one goal, one call to
 * action. Lives at /campanha-exemplo/.
 */
export const landing = ({
  heroImage,
}: {
  heroImage: Media
}): RequiredDataFromCollectionSlug<'pages'> => ({
  title: 'Campanha de exemplo',
  slug: 'campanha-exemplo',
  template: 'landing',
  _status: 'published',
  hero: {
    type: 'brand',
    richText: richText(
      { tag: 'h1', text: 'Cartão sem anuidade, de verdade' },
      'Peça o seu em poucos minutos pelo app e comece a usar o cartão virtual na hora.',
    ),
    links: [{ link: { ...custom('Quero meu cartão', '/'), appearance: 'default' } }],
    media: heroImage.id,
    disclaimer: 'Página de exemplo de campanha. Sujeito a análise de crédito.',
  },
  layout: [
    {
      blockType: 'cards',
      variant: 'simple',
      heading: 'Por que pedir o seu',
      columns: '3',
      items: [
        { title: 'Sem anuidade', text: 'Nenhuma tarifa para ter ou manter o cartão.' },
        { title: 'Cartão virtual', text: 'Use nas compras online assim que for aprovado.' },
        { title: 'Tudo no app', text: 'Acompanhe a fatura e o limite pelo celular.' },
      ],
    },
    {
      blockType: 'cta',
      theme: 'navy',
      richText: richText(
        { tag: 'h2', text: 'Peça agora, é rápido' },
        'Baixe o app e faça sua solicitação.',
      ),
      links: [{ link: { ...custom('Quero meu cartão', '/'), appearance: 'default' } }],
    },
  ],
  meta: {
    title: 'Campanha de exemplo | Digio',
    description: 'Exemplo de landing page de campanha, sem menu e rodapé.',
  },
})
