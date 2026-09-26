import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Faq, Media } from '@digio/payload-types'

type HomeArgs = {
  heroImage: Media
  cardImages: [Media, Media, Media]
  faqs: Faq[]
}

const text = (value: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

/** Lexical document with an optional heading followed by paragraphs. */
const richText = (heading: { tag: 'h1' | 'h2'; text: string } | null, ...paragraphs: string[]) =>
  ({
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        ...(heading
          ? [
              {
                type: 'heading',
                tag: heading.tag,
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
                children: [text(heading.text)],
              },
            ]
          : []),
        ...paragraphs.map((value) => ({
          type: 'paragraph',
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
          children: [text(value)],
        })),
      ],
    },
  }) as never

const custom = (label: string, url: string) => ({ type: 'custom' as const, label, url })

/**
 * Digio home built with the design system blocks. The layout follows the Uber Conta reference
 * (dark hero, feature cards, products, testimonials, solutions grid, blog and FAQ); the content is
 * Digio's. Testimonials are placeholders: replace them with real, authorized ones.
 */
export const home = ({
  heroImage,
  cardImages,
  faqs,
}: HomeArgs): RequiredDataFromCollectionSlug<'pages'> => ({
  title: 'Home',
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'brand',
    richText: richText(
      { tag: 'h1', text: 'Sua vida financeira mais simples, tudo no app' },
      'Conta digital gratuita, cartão sem anuidade, Pix e empréstimo com a segurança do Digio.',
    ),
    links: [
      { link: { ...custom('Abrir minha conta', '/'), appearance: 'default' } },
      { link: { ...custom('Conhecer o cartão', '/componentes/'), appearance: 'outline' } },
    ],
    media: heroImage.id,
    disclaimer:
      'Cartão sujeito a análise de crédito. Conta de pagamento. Consulte condições no app.',
  },
  layout: [
    {
      blockType: 'cards',
      variant: 'feature',
      heading: 'Um banco completo no seu bolso',
      intro: 'Tudo o que você precisa para organizar o dinheiro, sem tarifa escondida.',
      columns: '3',
      items: [
        {
          title: 'Cartão sem anuidade',
          text: 'Crédito com limite que cresce com você e cartão virtual para compras online.',
          image: cardImages[0].id,
          background: 'navy',
          enableLink: true,
          link: custom('Conhecer', '/componentes/'),
        },
        {
          title: 'Conta digital gratuita',
          text: 'Pix, transferências e pagamento de contas sem pagar nada por isso.',
          image: cardImages[1].id,
          background: 'blue',
          enableLink: true,
          link: custom('Conhecer', '/componentes/'),
        },
        {
          title: 'Digio Invest',
          text: 'Seu dinheiro rendendo com liquidez diária, direto no app.',
          image: cardImages[2].id,
          background: 'lilac',
          enableLink: true,
          link: custom('Conhecer', '/componentes/'),
        },
      ],
    },
    {
      blockType: 'cards',
      variant: 'product',
      theme: 'lilac',
      heading: 'Crédito na medida certa',
      intro: 'Contrate pelo app, com taxas claras e parcelas que cabem no seu bolso.',
      columns: '2',
      items: [
        {
          title: 'Empréstimo pessoal',
          text: 'Dinheiro na conta em poucos minutos, com parcelas fixas.',
          image: cardImages[0].id,
          enableLink: true,
          link: custom('Conhecer', '/componentes/'),
        },
        {
          title: 'Antecipação do FGTS',
          text: 'Receba antes o saque-aniversário do seu FGTS.',
          image: cardImages[1].id,
          enableLink: true,
          link: custom('Conhecer', '/componentes/'),
        },
      ],
    },
    {
      blockType: 'testimonials',
      theme: 'blue',
      heading: 'Quem usa, recomenda',
      items: [
        {
          quote: 'Abri a conta em minutos e **o cartão chegou sem anuidade**. Uso tudo pelo app.',
          author: 'Cliente de exemplo',
          detail: 'Depoimento ilustrativo',
        },
        {
          quote: 'O Pix é rápido e **consigo acompanhar cada gasto** em tempo real.',
          author: 'Cliente de exemplo',
          detail: 'Depoimento ilustrativo',
        },
        {
          quote: 'Precisei de um empréstimo e **o dinheiro caiu no mesmo dia**.',
          author: 'Cliente de exemplo',
          detail: 'Depoimento ilustrativo',
        },
        {
          quote: 'Gosto de **bloquear e desbloquear o cartão** direto no celular.',
          author: 'Cliente de exemplo',
          detail: 'Depoimento ilustrativo',
        },
      ],
    },
    {
      blockType: 'cards',
      variant: 'icon',
      theme: 'navy',
      heading: 'Soluções para o seu dia a dia',
      intro: 'Resolva tudo em poucos toques, a qualquer hora.',
      columns: '4',
      items: [
        { title: 'Pix', text: 'Envie e receba na hora, 24h.', icon: 'qr-code' },
        { title: 'Pagamento de contas', text: 'Boletos e contas de consumo.', icon: 'receipt' },
        { title: 'Recarga de celular', text: 'Todas as operadoras.', icon: 'smartphone' },
        { title: 'Cartão virtual', text: 'Compras online mais seguras.', icon: 'credit-card' },
        { title: 'Transferências', text: 'Para qualquer banco.', icon: 'arrow-left-right' },
        { title: 'Cofrinhos', text: 'Guarde dinheiro para seus objetivos.', icon: 'piggy-bank' },
        { title: 'Seguros', text: 'Proteção para você e seu cartão.', icon: 'shield-check' },
        { title: 'Cashback e ofertas', text: 'Vantagens em parceiros.', icon: 'gift' },
      ].map((item) => ({ ...item, icon: item.icon as never })),
    },
    {
      blockType: 'archive',
      populateBy: 'collection',
      relationTo: 'posts',
      limit: 3,
      introContent: richText(
        { tag: 'h2', text: 'Blog do Digio' },
        'Dicas para cuidar melhor do seu dinheiro.',
      ),
      enableMoreLink: true,
      moreLink: custom('Ir para o blog', '/blog/'),
    },
    {
      blockType: 'faq',
      theme: 'lilac',
      heading: 'Perguntas frequentes',
      faqs: faqs.map((faq) => faq.id),
      enableMoreLink: true,
      moreLink: custom('Outras dúvidas', '/central-de-ajuda/'),
    },
    {
      blockType: 'cta',
      theme: 'navy',
      richText: richText(
        { tag: 'h2', text: 'Abra sua conta Digio' },
        'É grátis e leva poucos minutos. Baixe o app e comece agora.',
      ),
      links: [{ link: { ...custom('Abrir minha conta', '/'), appearance: 'default' } }],
    },
  ],
  meta: {
    title: 'Digio | Conta digital, cartão sem anuidade e empréstimo',
    description:
      'Conta digital gratuita, cartão sem anuidade, Pix e empréstimo pessoal. Tudo pelo app do Digio.',
    image: heroImage.id,
  },
})
