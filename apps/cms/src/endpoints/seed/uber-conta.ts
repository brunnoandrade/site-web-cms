import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

const dirname = path.dirname(fileURLToPath(import.meta.url))

const APP_URL = 'https://uberconta.onelink.me/asYc/nayzzxcl'

/**
 * Home of the Uber Conta property (ubercontabrasil.com.br), built only with the platform blocks:
 * dark hero, shortcut cards, loan cards, testimonials, solutions grid, blog, FAQ and footer.
 * Texts are those of the current site. Images are placeholders from the template; the real ones
 * are uploaded to the media library. The hero has no video here: upload one in the admin (hero > Vídeo de fundo). What the blocks cannot do yet (desktop
 * and mobile image pairs) is listed in docs/uber-conta.md.
 */
export async function seedUberConta({ payload, req, tenant, images, context }: Args) {
  const withTenant = <T extends object>(data: T) => ({ ...data, tenant: tenant.id })

  payload.logger.info(`— Seeding Uber Conta: FAQs, home, header and footer...`)

  const faqs = []
  for (const [question, answer] of [
    [
      'O que é a Uber Conta?',
      'A Uber Conta é uma conta digital criada para motoristas e entregadores da Uber em parceria com o Digio. Com ela você recebe seus ganhos na hora, tem Pix ilimitados, empréstimos e desconto em diversos parceiros.',
    ],
    [
      'Quem pode ter a Uber Conta?',
      'Para abrir uma Uber Conta você precisa ser um motorista ativo na Uber, ter pelo menos 25 viagens ou entregas com a Uber e não possuir restrições legais no CPF. Além disso, é feita uma análise de crédito para aprovação da conta.',
    ],
    [
      'Como abro uma Uber Conta?',
      'No app "Uber Driver", vá até o menu "Carteira" para iniciar o processo. Preencha seus dados pessoais, endereço residencial e informe onde deseja receber seu cartão Uber. Depois, baixe o app da Uber Conta e faça o primeiro acesso com o mesmo e-mail e número de celular cadastrados no Uber Driver. Por fim, crie uma senha para o aplicativo.',
    ],
    [
      'A Uber Conta é segura?',
      'Sim. Para acessar seu saldo, cartão ou fazer qualquer movimentação, você sempre precisa de senha ou biometria. Também é possível configurar limites para transferências, como no Pix. A Uber Conta é operada pelo Digio, que faz parte do grupo Bradesco.',
    ],
    [
      'Posso abrir uma Uber Conta sem ser parceiro da Uber?',
      'A Uber Conta foi criada para oferecer vantagens exclusivas a motoristas e entregadores parceiros da Uber. Por isso, só é possível abrir uma Uber Conta se você for um parceiro ativo na plataforma.',
    ],
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

  // Logos and badges from the current site, rasterized (the media library refuses SVG).
  // The header is dark (white logo); the footer is light, like the current site (black logos).
  const upload = async (file: string, alt: string) => {
    const data = await readFile(path.resolve(dirname, 'uber-conta-assets', file))
    return payload.create({
      collection: 'media',
      req,
      context,
      data: withTenant({ alt }),
      file: { name: file, data, mimetype: 'image/png', size: data.byteLength },
    })
  }
  // The shortcut photos (1: square on black, 2 and 3: portrait), already cropped for the cards.
  const shortcut1 = await upload('shortcut-1.png', 'Notificação "Ganhos Uber" no celular')
  const shortcut2 = await upload('shortcut-2.png', 'Mão segurando o celular com o app Uber Conta')
  const shortcut3 = await upload('shortcut-3.png', 'Cartões Uber Conta')
  // Provisional mobile versions: crops of the photos above (the originals are not available).
  const shortcutMobile = [
    await upload('shortcut-1-mobile.png', 'Notificação "Ganhos Uber" no celular'),
    await upload('shortcut-2-mobile.png', 'Mão segurando o celular com o app Uber Conta'),
    await upload('shortcut-3-mobile.png', 'Cartões Uber Conta'),
  ]

  await payload.create({
    collection: 'pages',
    depth: 0,
    req,
    context,
    data: withTenant({
      title: 'Home',
      slug: 'home',
      _status: 'published' as const,
      hero: {
        type: 'fullscreen' as const,
        richText: richText({ tag: 'h1', text: 'Receba seus ganhos na hora com a Uber Conta!' }),
        links: [
          { link: { ...custom('Conhecer mais', '#solucoes'), appearance: 'default' as const } },
        ],
        media: images[0].id,
        disclaimer:
          'Este é um produto oferecido pelo Banco Digio e está sujeito à elegibilidade, análise de crédito e condições variáveis.',
        disclaimerLink: custom('Saber mais.', '#solucoes'),
      },
      layout: [
        {
          blockType: 'cards' as const,
          anchor: 'atalhos',
          variant: 'shortcut' as const,
          theme: 'light' as const,
          heading: 'Tudo que você precisa, em um só lugar!',
          intro: 'Soluções digitais para simplificar seu dia a dia.',
          columns: '3' as const,
          items: [
            {
              title: 'Dirigiu, recebeu:\nSimples assim!',
              text: 'O dinheiro das suas corridas cai na hora.',
              image: shortcut1.id,
              imageMobile: shortcutMobile[0].id,
              background: 'navy' as const,
              enableLink: true,
              link: custom('Conta', '/conta-digital/'),
            },
            {
              title: 'Um aplicativo\ncompleto',
              text: 'As ferramentas que facilitam a sua rotina.',
              image: shortcut2.id,
              imageMobile: shortcutMobile[1].id,
              background: 'blue' as const,
              enableLink: true,
              link: custom('Conta', '/conta-digital/'),
            },
            {
              title: 'Cartão para usar\ncomo quiser',
              text: 'Toda a facilidade que você precisa,\nna palma da mão.',
              image: shortcut3.id,
              imageMobile: shortcutMobile[2].id,
              background: 'lilac' as const,
              enableLink: true,
              link: custom('Cartão', '/cartao/'),
            },
          ],
        },
        {
          blockType: 'cards' as const,
          variant: 'product' as const,
          theme: 'lilac' as const,
          anchor: 'emprestimo',
          heading: 'Empréstimos para todos os bolsos',
          columns: '2' as const,
          items: [
            {
              title: 'Crédito Pessoal',
              text: 'Até R$ 10.000 na conta em minutos, com pagamento em até 18x.',
              enableLink: true,
              link: custom('Conhecer', '/credito-pessoal/'),
            },
            {
              title: 'Crédito Rápido',
              text: 'Empréstimos emergenciais de até R$ 300 com possibilidade de recontratação.',
              enableLink: true,
              link: custom('Conhecer', '/credito-rapido/'),
            },
          ],
        },
        {
          // Quotes taken from the current site (public): confirm authorization before publishing.
          blockType: 'testimonials' as const,
          theme: 'blue' as const,
          anchor: 'depoimentos',
          heading: 'Os motoristas parceiros recomendam',
          items: [
            {
              quote:
                '**O app está muito** bem elaborado e informado, **gosto muito de utilizá-lo. É simples de resolver tudo**.',
              author: 'Ed',
            },
            {
              quote: '**O aplicativo é** fácil de usar e prático **no dia a dia...**',
              author: 'Pe',
            },
            {
              quote:
                '**O aplicativo para o repasse dos ganhos** é bem prático e organizado em geral.',
              author: 'Sa',
            },
          ],
        },
        {
          blockType: 'cards' as const,
          variant: 'icon' as const,
          theme: 'navy' as const,
          anchor: 'solucoes',
          heading: 'Soluções focadas nas suas necessidades!',
          columns: '3' as const,
          items: [
            {
              title: 'Débitos Veiculares',
              text: 'Parcele IPVA, licenciamento e multas em até 12x.',
              icon: 'car' as const,
              enableLink: true,
              link: custom('Débitos Veiculares', '/debitos-veiculares/'),
            },
            {
              title: 'Uber Conta Desconto',
              text: 'Compre com descontos em grandes marcas.',
              icon: 'percent' as const,
              enableLink: true,
              link: custom('Descontos', '/descontos/'),
            },
            {
              title: 'Uber Chip',
              text: 'Planos de 14GB a 55GB a partir de R$ 20, com apps liberados e bônus exclusivos.',
              icon: 'smartphone' as const,
              enableLink: true,
              link: custom('Uber Chip', '/uber-chip/'),
            },
            {
              title: 'Seguro Celular',
              text: 'Proteja seu aparelho de imprevistos por apenas R$ 29,90 ao mês.',
              icon: 'shield-check' as const,
              enableLink: true,
              link: custom('Seguro Celular', '/seguro-celular/'),
            },
            {
              title: 'Tag Veloe',
              text: 'Adquira sua tag de pedágio por apenas R$ 8,90 ao mês.',
              icon: 'receipt' as const,
              enableLink: true,
              link: custom('Tag Veloe', '/tag-veloe/'),
            },
            {
              title: 'Atendimento 24h',
              text: 'Conte com suporte via aplicativo ou telefone.',
              icon: 'clock' as const,
              enableLink: true,
              link: custom('Central de ajuda', '/central-de-ajuda/'),
            },
          ],
        },
        {
          blockType: 'archive' as const,
          anchor: 'blog',
          populateBy: 'collection' as const,
          relationTo: 'posts' as const,
          limit: 3,
          introContent: richText(
            { tag: 'h2', text: 'Conteúdo relevante para seu dia a dia' },
            'Uber Blog',
          ),
          enableMoreLink: true,
          moreLink: custom('Ir para o Blog', '/blog/'),
        },
        {
          blockType: 'faq' as const,
          theme: 'lilac' as const,
          anchor: 'ajuda',
          heading: 'Ficou com alguma dúvida?',
          faqs: faqs.map((faq) => faq.id),
          enableMoreLink: true,
          moreLink: custom('Outras dúvidas', '/central-de-ajuda/'),
        },
      ],
      meta: {
        title: 'Receba seus ganhos na hora com a Uber Conta!',
        description:
          'Plataforma financeira integrada para motoristas e usuários, com soluções de conta digital, cartão, empréstimos, benefícios e serviços inteligentes.',
        image: images[0].id,
      },
    }),
  })

  // One at a time: the seed shares a single transaction (`req`).
  const logoHeader = await upload('logo-header-white.png', 'Uber Conta')
  const logoHorizontal = await upload('logo-horizontal-black.png', 'Uber Conta by Digio')
  const logoStacked = await upload('logo-stacked-black.png', 'Uber Conta by Digio')
  const creditCard = await upload('credit-card.png', 'Cartões Uber Conta')
  const googlePlay = await upload('google-play.png', 'Baixar na Google Play')
  const appStore = await upload('app-store.png', 'Baixar na App Store')

  const links = (...items: [string, string][]) =>
    items.map(([label, url]) => ({ link: custom(label, url) }))

  await payload.create({
    collection: 'header',
    req,
    context,
    data: withTenant({
      logo: logoHeader.id,
      enableCta: true,
      cta: custom('Abrir conta', APP_URL),
      navItems: [
        {
          kind: 'mega' as const,
          mega: {
            label: 'Pra você',
            title: 'Pra você',
            description: 'Tudo que você precisa num só lugar!',
            groups: [
              {
                label: 'Conta digital',
                links: links(
                  ['Conta', '/conta-digital/'],
                  ['Pix', '/pix/'],
                  ['Cartão', '/cartao/'],
                  ['Investimentos', '/cdb/'],
                ),
              },
              {
                label: 'Empréstimos',
                links: links(
                  ['Crédito Pessoal', '/credito-pessoal/'],
                  ['Crédito Rápido', '/credito-rapido/'],
                  ['Antecipação do FGTS', '/antecipacao-do-fgts/'],
                ),
              },
              {
                label: 'Soluções',
                links: links(
                  ['Débitos veiculares', '/debitos-veiculares/'],
                  ['Seguro Celular', '/seguro-celular/'],
                  ['Tag Veloe', '/tag-veloe/'],
                  ['Descontos', '/descontos/'],
                  ['Cashback', '/cashback/'],
                ),
              },
              {
                label: 'Benefícios',
                links: links(
                  ['Uber Chip', '/uber-chip/'],
                  ['Cashback no Ipiranga', '/km-de-vantagens/'],
                ),
              },
              {
                // Destination pages of this column are not mapped yet: placeholders.
                label: 'Parceria ELO',
                links: links(
                  ['Vantagens exclusivas', '/descontos/'],
                  ['Descontos em compras', '/descontos/'],
                ),
              },
            ],
          },
        },
        { kind: 'link' as const, link: custom('Sobre', '/sobre/') },
        { kind: 'link' as const, link: custom('Blog', '/blog/') },
        {
          // The current site shows a chevron on "Ajuda"; its panel content is a placeholder.
          kind: 'mega' as const,
          mega: {
            label: 'Ajuda',
            title: 'Ajuda',
            description: 'Tire suas dúvidas e fale com a gente.',
            groups: [
              {
                label: 'Atendimento',
                links: links(
                  ['Central de ajuda', '/central-de-ajuda/'],
                  ['Informações financeiras', '/informacoes-financeiras/'],
                ),
              },
            ],
          },
        },
      ],
    }),
  })

  await payload.create({
    collection: 'footer',
    req,
    context,
    data: withTenant({
      logo: logoStacked.id,
      logoMobile: logoHorizontal.id,
      highlightImage: creditCard.id,
      columns: [
        {
          title: 'Conta digital',
          links: links(
            ['Conta', '/conta-digital/'],
            ['Pix', '/pix/'],
            ['Cartão', '/cartao/'],
            ['Investimentos', '/cdb/'],
          ),
        },
        {
          title: 'Empréstimos',
          links: links(
            ['Crédito Pessoal', '/credito-pessoal/'],
            ['Crédito Rápido', '/credito-rapido/'],
            ['Antecipação do FGTS', '/antecipacao-do-fgts/'],
          ),
        },
        {
          title: 'Soluções',
          links: links(
            ['Débitos Veiculares', '/debitos-veiculares/'],
            ['Seguro Celular', '/seguro-celular/'],
            ['Tag Veloe', '/tag-veloe/'],
            ['Descontos', '/descontos/'],
            ['Cashback', '/cashback/'],
          ),
        },
        {
          title: 'Benefícios',
          links: links(['Uber Chip', '/uber-chip/'], ['Cashback no Ipiranga', '/km-de-vantagens/']),
        },
        {
          title: 'Institucional',
          links: links(
            ['Sobre', '/sobre/'],
            ['Blog', '/blog/'],
            ['Ajuda', '/central-de-ajuda/'],
            ['Informações financeiras', '/informacoes-financeiras/'],
          ),
        },
        {
          title: 'Baixe o app',
          links: [
            {
              link: {
                ...custom(
                  'Baixar na Google Play',
                  'https://play.google.com/store/apps/details?id=br.com.digio.uber',
                ),
                newTab: true,
              },
              image: googlePlay.id,
            },
            {
              link: {
                ...custom(
                  'Baixar na App Store',
                  'http://apps.apple.com/us/app/uber-conta/id1550784531',
                ),
                newTab: true,
              },
              image: appStore.id,
            },
          ],
        },
      ],
      legalText: '© 2026 Banco Digio S.A. - Instituição financeira. 27.098.060/0001-45.',
    }),
  })
}
