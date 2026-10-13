import type { Payload, PayloadRequest } from 'payload'

import type { Media, Tenant } from '@digio/payload-types'

import { custom, richText } from './home'

type Args = {
  payload: Payload
  req: PayloadRequest
  tenant: Tenant
  images: [Media, Media, Media]
  context: Record<string, unknown>
}

/**
 * Demo content of a campaign property: a small landing page ("indique e ganhe") with its own
 * rules page, FAQs, header and footer. No blog and no help center, unlike the main Digio
 * property. The offer is fictional: no values or dates, everything points to the rules.
 */
export async function seedCampaign({ payload, req, tenant, images, context }: Args) {
  const withTenant = <T extends object>(data: T) => ({ ...data, tenant: tenant.id })

  payload.logger.info(`— Seeding campaign: rules, FAQs, home, header and footer...`)

  await payload.create({
    collection: 'pages',
    depth: 0,
    req,
    context,
    data: withTenant({
      title: 'Regulamento',
      slug: 'regulamento',
      _status: 'published' as const,
      hero: {
        type: 'lowImpact' as const,
        richText: richText({ tag: 'h1', text: 'Regulamento da campanha' }),
      },
      meta: { title: 'Regulamento | Campanha Exemplo', description: 'Regras da campanha.' },
      layout: [
        {
          blockType: 'content' as const,
          columns: [
            {
              size: 'full' as const,
              richText: richText(
                { tag: 'h2', text: '1. Quem pode participar' },
                'Texto de exemplo. Aqui entram as condições de participação definidas pelo jurídico.',
              ),
            },
            {
              size: 'full' as const,
              richText: richText(
                { tag: 'h2', text: '2. Período e benefício' },
                'Texto de exemplo. Período, valores e forma de pagamento ficam apenas neste regulamento.',
              ),
            },
          ],
        },
      ],
    }),
  })

  const faqs = []
  for (const [question, answer] of [
    ['Quem pode participar?', 'Clientes com conta ativa, conforme o regulamento.'],
    ['Como indico um amigo?', 'No app, em Indicar amigos, compartilhe o seu link.'],
    ['Quando recebo o benefício?', 'Depois que o amigo concluir os passos do regulamento.'],
  ] as const) {
    faqs.push(
      await payload.create({
        collection: 'faqs',
        req,
        context,
        data: withTenant({ question, answer: richText(null, answer) }),
      }),
    )
  }

  await payload.create({
    collection: 'pages',
    depth: 0,
    req,
    context,
    data: withTenant({
      title: 'Indique e ganhe',
      slug: 'home',
      _status: 'published' as const,
      hero: {
        type: 'brand' as const,
        richText: richText(
          { tag: 'h1', text: 'Indique um amigo e ganhem juntos' },
          'Convide quem você gosta para a conta digital e receba um benefício quando ele participar.',
        ),
        links: [
          { link: { ...custom('Quero participar', '/'), appearance: 'default' as const } },
          {
            link: { ...custom('Ver regulamento', '/regulamento/'), appearance: 'outline' as const },
          },
        ],
        media: images[0].id,
        disclaimer: 'Campanha de exemplo do ambiente local. Condições e valores no regulamento.',
      },
      layout: [
        {
          blockType: 'cards' as const,
          variant: 'simple' as const,
          theme: 'lilac' as const,
          heading: 'Como participar',
          columns: '3' as const,
          items: [
            { title: '1. Compartilhe', text: 'Envie o seu link de indicação pelo app.' },
            { title: '2. Seu amigo se cadastra', text: 'Ele abre a conta usando o seu link.' },
            { title: '3. Vocês ganham', text: 'O benefício é liberado conforme o regulamento.' },
          ],
        },
        {
          blockType: 'cards' as const,
          variant: 'icon' as const,
          theme: 'navy' as const,
          heading: 'Vantagens da campanha',
          columns: '4' as const,
          items: [
            {
              title: 'Para os dois',
              text: 'Você e quem você indica ganham.',
              icon: 'gift' as const,
            },
            {
              title: 'Sem limite',
              text: 'Indique quantos amigos quiser.',
              icon: 'wallet' as const,
            },
            { title: 'Rápido', text: 'Cadastro em poucos minutos.', icon: 'clock' as const },
            { title: 'Seguro', text: 'Tudo pelo app do Digio.', icon: 'shield-check' as const },
          ],
        },
        {
          blockType: 'faq' as const,
          theme: 'light' as const,
          heading: 'Dúvidas sobre a campanha',
          faqs: faqs.map((faq) => faq.id),
          enableMoreLink: true,
          moreLink: custom('Ler o regulamento', '/regulamento/'),
        },
        {
          blockType: 'cta' as const,
          theme: 'blue' as const,
          richText: richText(
            { tag: 'h2', text: 'Convide agora' },
            'Abra o app, toque em Indicar amigos e compartilhe o seu link.',
          ),
          links: [{ link: { ...custom('Quero participar', '/'), appearance: 'default' as const } }],
        },
      ],
      meta: {
        title: 'Campanha Exemplo | Indique e ganhe',
        description: 'Indique um amigo para o Digio e ganhem juntos. Veja como participar.',
        image: images[0].id,
      },
    }),
  })

  await payload.create({
    collection: 'header',
    req,
    context,
    data: withTenant({
      enableCta: true,
      cta: custom('Participar', '/'),
      navItems: [
        { link: custom('Regulamento', '/regulamento/') },
      ],
    }),
  })

  await payload.create({
    collection: 'footer',
    req,
    context,
    data: withTenant({
      columns: [
        {
          title: 'Campanha',
          links: [{ link: custom('Regulamento', '/regulamento/') }],
        },
        {
          title: 'Ajuda',
          links: [
          ],
        },
      ],
      legalText:
        'Campanha de demonstração do ambiente local. Benefícios sujeitos ao regulamento e às condições vigentes.',
    }),
  })
}
