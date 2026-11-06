import type { Payload, PayloadRequest } from 'payload'

import type { Media, Tenant } from '@/payload-types'

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
 * Demo catalog: FAQs and help center,
 * plus the "componentes" page that uses every block.
 */
export async function seedCatalog({ payload, req, tenant, image, context }: Args) {
  const withTenant = <T extends object>(data: T) => ({ ...data, tenant: tenant.id })

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
          blockType: 'faq' as const,
          heading: 'Perguntas frequentes',
          faqs: faqs.map((faq) => faq.id),
        },
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
