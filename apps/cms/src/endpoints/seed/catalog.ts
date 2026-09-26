import type { Payload, PayloadRequest } from 'payload'

import type { Media, Tenant } from '@digio/payload-types'

/** Minimal Lexical document with one paragraph. */
export const paragraph = (text: string) =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          children: [
            { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
          ],
        },
      ],
    },
  }) as never

type Args = {
  payload: Payload
  req: PayloadRequest
  tenant: Tenant
  image: Media
  context: Record<string, unknown>
}

/**
 * Demo catalog: products, a published (validated) rate table, FAQs, help center and a banner,
 * plus the "componentes" page that uses every block.
 */
export async function seedCatalog({ payload, req, tenant, image, context }: Args) {
  const withTenant = <T extends object>(data: T) => ({ ...data, tenant: tenant.id })

  const card = await payload.create({
    collection: 'products',
    req,
    context,
    data: withTenant({
      name: 'Cartão de crédito',
      slug: 'cartao-de-credito',
      category: 'credit-card' as const,
      summary: 'Cartão sem anuidade, com controle total pelo app.',
      image: image.id,
      benefits: [{ text: 'Sem anuidade' }, { text: 'Cartão virtual para compras online' }],
      enableLink: true,
      link: { type: 'custom' as const, url: '/cartao/', label: 'Peça o seu' },
    }),
  })

  const loan = await payload.create({
    collection: 'products',
    req,
    context,
    data: withTenant({
      name: 'Empréstimo pessoal',
      slug: 'emprestimo-pessoal',
      category: 'loan' as const,
      summary: 'Crédito com taxas a partir de 1,99% ao mês, direto pelo app.',
      image: image.id,
      enableLink: true,
      link: { type: 'custom' as const, url: '/emprestimo/', label: 'Simule no app' },
    }),
  })

  // Passes every rule of validateRates: 1.99% a.m. = 26.68% a.a.; CET 2.20% a.m. = 29.84% a.a.
  const rates = await payload.create({
    collection: 'rates',
    req,
    context,
    data: withTenant({
      title: 'Empréstimo pessoal: taxas vigentes',
      product: loan.id,
      validFrom: '2026-10-01T12:00:00.000Z',
      items: [
        {
          label: 'Juros',
          kind: 'interest' as const,
          period: 'monthly' as const,
          valueType: 'percent' as const,
          value: 1.99,
          valueMax: 6.99,
        },
        {
          label: 'Juros',
          kind: 'interest' as const,
          period: 'yearly' as const,
          valueType: 'percent' as const,
          value: 26.68,
        },
        {
          label: 'CET',
          kind: 'cet' as const,
          period: 'monthly' as const,
          valueType: 'percent' as const,
          value: 2.2,
        },
        {
          label: 'CET',
          kind: 'cet' as const,
          period: 'yearly' as const,
          valueType: 'percent' as const,
          value: 29.84,
        },
        {
          label: 'Tarifa de cadastro',
          kind: 'fee' as const,
          period: 'once' as const,
          valueType: 'currency' as const,
          value: 0,
        },
      ],
      legalNote:
        'Taxas sujeitas à análise de crédito. Exemplo para desenvolvimento: não são as taxas reais do Digio.',
      _status: 'published' as const,
    }),
  })

  const [accountCategory, cardCategory] = await Promise.all([
    payload.create({
      collection: 'help-categories',
      req,
      context,
      data: withTenant({ title: 'Conta', slug: 'conta', order: 1 }),
    }),
    payload.create({
      collection: 'help-categories',
      req,
      context,
      data: withTenant({ title: 'Cartão', slug: 'cartao', order: 2 }),
    }),
  ])

  const faqs = []
  for (const [question, answer, category] of [
    [
      'Como peço o cartão?',
      'Baixe o app, abra sua conta e peça o cartão na tela inicial.',
      cardCategory,
    ],
    ['O cartão tem anuidade?', 'Não. O cartão não tem anuidade.', cardCategory],
    ['Como altero meus dados?', 'No app, acesse Perfil e depois Meus dados.', accountCategory],
  ] as const) {
    faqs.push(
      await payload.create({
        collection: 'faqs',
        req,
        context,
        data: withTenant({ question, answer: paragraph(answer), category: category.id }),
      }),
    )
  }

  // Same structure as the current help center: /central-de-ajuda/<topico>/<pergunta>/.
  await payload.create({
    collection: 'help-topics',
    req,
    context,
    data: withTenant({
      title: 'Cartão Digio',
      slug: 'cartao-digio',
      category: cardCategory.id,
      order: 1,
      summary: 'Pedido, entrega, anuidade e uso do cartão.',
      content: paragraph('Tudo sobre o seu cartão Digio.'),
      faqs: [faqs[0]!.id, faqs[1]!.id],
      _status: 'published' as const,
    }),
  })
  await payload.create({
    collection: 'help-topics',
    req,
    context,
    data: withTenant({
      title: 'Meus dados',
      slug: 'meus-dados',
      category: accountCategory.id,
      order: 1,
      summary: 'Cadastro e dados pessoais.',
      faqs: [faqs[2]!.id],
      _status: 'published' as const,
    }),
  })

  const banner = await payload.create({
    collection: 'banners',
    req,
    context,
    data: withTenant({
      title: 'Banner de exemplo',
      alt: 'Pessoa usando o app no celular',
      image: image.id,
      enableLink: true,
      link: { type: 'custom' as const, url: '/cartao/', label: 'Conheça o cartão' },
      active: true,
    }),
  })

  await payload.create({
    collection: 'pages',
    req,
    context,
    data: withTenant({
      title: 'Componentes',
      slug: 'componentes',
      _status: 'published' as const,
      hero: {
        type: 'lowImpact' as const,
        richText: paragraph('Página de demonstração de todos os blocos.'),
      },
      meta: { title: 'Componentes', description: 'Demonstração dos blocos do site.' },
      layout: [
        {
          blockType: 'content' as const,
          columns: [{ size: 'full' as const, richText: paragraph('Bloco de texto rico.') }],
        },
        {
          blockType: 'cards' as const,
          heading: 'Por que o Digio',
          columns: '3' as const,
          items: [
            { title: 'Sem anuidade', text: 'Cartão sem anuidade.' },
            { title: 'Tudo no app', text: 'Conta, cartão e empréstimo no mesmo lugar.' },
            { title: 'Seguro', text: 'Cartão virtual e bloqueio pelo app.' },
          ],
        },
        {
          blockType: 'productHighlight' as const,
          product: card.id,
          imagePosition: 'right' as const,
        },
        {
          blockType: 'ratesTable' as const,
          heading: 'Taxas do empréstimo pessoal',
          rates: rates.id,
        },
        {
          blockType: 'faq' as const,
          heading: 'Perguntas frequentes',
          faqs: faqs.map((faq) => faq.id),
        },
        { blockType: 'bannerSection' as const, banner: banner.id },
        {
          blockType: 'mediaBlock' as const,
          media: image.id,
        },
        {
          blockType: 'cta' as const,
          richText: paragraph('Abra sua conta em poucos minutos.'),
          links: [
            {
              link: {
                type: 'custom' as const,
                url: '/',
                label: 'Abrir conta',
                appearance: 'default' as const,
              },
            },
          ],
        },
        {
          blockType: 'archive' as const,
          populateBy: 'collection' as const,
          relationTo: 'posts' as const,
          limit: 3,
          introContent: paragraph('Últimos posts do blog.'),
        },
      ],
    }),
  })

  return { faqs }
}
