import type { CollectionConfig } from 'payload'

import { anyone, getTenantIDsWithRoles, isSuperAdmin, superAdminOnly } from '../../access/roles'
import { normalizeDomains, validateUniqueDomains } from './hooks/domains'
import { revalidateSite } from './hooks/revalidate'
import { matches, robotsRules } from './validators'

/**
 * A tenant is one web property (institutional site, landing page) with its own
 * domains, content, users and media. New properties are created here, without a deploy.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: { singular: 'Propriedade', plural: 'Propriedades' },
  access: {
    // Public: the website resolves the request host to a tenant through the API.
    read: anyone,
    create: superAdminOnly,
    delete: superAdminOnly,
    // Tenant admins can edit their own property (name, domains).
    update: ({ req: { user } }) => {
      if (isSuperAdmin(user)) return true
      const ids = getTenantIDsWithRoles(user, ['admin'])
      return ids.length > 0 ? { id: { in: ids } } : false
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'siteUrl'],
    group: 'Plataforma',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Geral',
          description: 'Identidade e endereços da propriedade.',
          fields: [
            {
              name: 'name',
              label: 'Nome',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                description:
                  'Identificador técnico (ex.: digio). Usado nas pastas de mídia e no cache.',
              },
              access: {
                // Changing the slug would orphan cached pages and media folders.
                update: ({ req: { user } }) => isSuperAdmin(user),
              },
              validate: (value: unknown) =>
                typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
                  ? true
                  : 'Use apenas letras minúsculas, números e hífens.',
            },
            {
              name: 'siteUrl',
              label: 'URL pública',
              type: 'text',
              required: true,
              admin: {
                description:
                  'URL principal da propriedade, sem barra no final (ex.: https://www.digio.com.br). Usada em SEO, sitemap e preview.',
              },
              validate: (value: unknown) => {
                if (typeof value !== 'string') return 'Informe a URL.'
                try {
                  const url = new URL(value)
                  if (!['http:', 'https:'].includes(url.protocol)) return 'Use http ou https.'
                  if (url.pathname !== '/' || value.endsWith('/'))
                    return 'Sem caminho nem barra no final.'
                  return true
                } catch {
                  return 'URL inválida.'
                }
              },
            },
            {
              name: 'domains',
              label: 'Domínios',
              type: 'array',
              minRows: 1,
              admin: {
                description:
                  'Hosts que respondem por esta propriedade (ex.: www.digio.com.br). Sem protocolo, porta ou caminho. Um domínio só pode pertencer a uma propriedade.',
              },
              fields: [
                {
                  name: 'domain',
                  label: 'Domínio',
                  type: 'text',
                  required: true,
                  index: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Aparência',
          description: 'Tema e estrutura visual do site. Novos temas e layouts exigem um deploy.',
          fields: [
            {
              // Visual identity of the property. Presets live in src/lib/themes.ts.
              name: 'themePreset',
              label: 'Tema visual',
              type: 'select',
              defaultValue: 'digio',
              options: [
                { label: 'Digio (marinho e turquesa)', value: 'digio' },
                { label: 'Uber Conta (preto e azul)', value: 'uber-conta' },
              ],
              admin: {
                description:
                  'Paleta aplicada a todo o site da propriedade. Novos temas exigem um deploy.',
              },
            },
            {
              // Structure of the menu and footer. Layouts live in src/layouts.
              name: 'layout',
              label: 'Layout do menu e rodapé',
              type: 'select',
              defaultValue: 'digio',
              options: [
                { label: 'Digio', value: 'digio' },
                { label: 'Uber Conta (mega menu)', value: 'uber-conta' },
              ],
              admin: {
                description:
                  'Estrutura visual do cabeçalho e do rodapé. Novos layouts exigem um deploy.',
              },
            },
            {
              name: 'themeColor',
              label: 'Cor do navegador',
              type: 'text',
              validate: matches(/^#[0-9a-fA-F]{6}$/, 'Formato: #RRGGBB'),
              admin: {
                description:
                  'Cor da barra do navegador no celular e do manifest do site. Ex.: #000000. Vazio: a do navegador.',
              },
            },
          ],
        },
        {
          label: 'URLs',
          description:
            'Política de URL da propriedade: precisa seguir o site que está sendo substituído, para a virada manter os endereços.',
          fields: [
            {
              // URL policy of the property (see src/routes). It must match the URLs of the site being
              // replaced, so the cutover keeps every address and loses no indexing.
              name: 'trailingSlash',
              label: 'Barra no final da URL',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Ligado: /pix/ (a forma canônica; /pix redireciona). Desligado: /pix (e /pix/ redireciona). Use a forma do site que está sendo substituído.',
              },
            },
            {
              name: 'blogUrlStyle',
              label: 'URL dos posts do blog',
              type: 'select',
              defaultValue: 'category',
              options: [
                {
                  label: 'Com categoria: /blog/<categoria>/<post>/ (padrão WordPress)',
                  value: 'category',
                },
                {
                  label: 'Plana: /blog/<post>, filtro em ?categoria= e páginas em ?page=',
                  value: 'flat',
                },
              ],
              admin: {
                description:
                  'Plana mantém o endereço dos posts quando o site atual não usa categoria na URL. Mudar isso muda os endereços dos posts: confira com o time de SEO.',
              },
            },
            {
              name: 'helpStyle',
              label: 'Estrutura da central de ajuda',
              type: 'select',
              defaultValue: 'topics',
              options: [
                {
                  label: 'Tópicos: /central-de-ajuda/<tópico>/<pergunta>/ (padrão Digio)',
                  value: 'topics',
                },
                {
                  label:
                    'Plana com busca: /central-de-ajuda/<pergunta>, categorias em ?slug= e busca em /central-de-ajuda/busca (padrão Uber Conta)',
                  value: 'flat',
                },
              ],
              admin: {
                description:
                  'Também define a busca do site nos dados estruturados: só a estrutura plana tem a busca da central. Mudar isso muda os endereços da central: confira com o time de SEO.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          description:
            'Padrões de busca e compartilhamento de todas as páginas, e o guia para assistentes de IA.',
          fields: [
            {
              name: 'locale',
              label: 'Idioma do conteúdo',
              type: 'text',
              defaultValue: 'pt-BR',
              validate: matches(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, 'Formato: pt-BR, en-US'),
              admin: {
                description:
                  'Código do idioma (BCP 47) dos dados estruturados e do manifest. Ex.: pt-BR. O atributo lang do HTML ainda é pt-BR em todo o site.',
              },
            },
            {
              // Search engine and social defaults of the property (page titles, share image).
              name: 'seoTitleSuffix',
              label: 'Sufixo do título das páginas',
              type: 'text',
              admin: {
                description:
                  'Anexado ao título de cada página no <title>. Ex.: " • Uber Conta". Vazio: " | <nome da propriedade>". Não vai para og:title nem twitter:title.',
              },
            },
            {
              name: 'seoDefaultImage',
              label: 'Imagem padrão de compartilhamento',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Usada em og:image e twitter:image quando a página não tem imagem própria (1200×630). Vazio: o ícone do app da propriedade e, sem ele, a imagem genérica da plataforma; preencha para não compartilhar uma imagem que não é da marca.',
              },
            },
            {
              name: 'llmsTxt',
              label: 'llms.txt (guia para assistentes de IA)',
              type: 'textarea',
              admin: {
                rows: 24,
                description:
                  'Servido em /llms.txt. Markdown: título (#), resumo (>), seções (##) com links "- [Nome](URL): descrição". Use {{siteUrl}} no lugar do endereço da propriedade. Vazio: /llms.txt não existe.',
              },
            },
          ],
        },
        {
          label: 'Indexação e ícones',
          description:
            'Como os buscadores e os navegadores enxergam a propriedade: bloqueio de indexação, regras do robots.txt, descrição padrão e ícones.',
          fields: [
            {
              name: 'blockIndexing',
              label: 'Bloquear indexação (ambientes de teste)',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Ligado: o robots.txt bloqueia tudo (Disallow: /) e todas as páginas saem com noindex, nofollow. Use em DEV e HML; em produção, deixe desligado.',
              },
            },
            {
              name: 'blockAiCrawlers',
              label: 'Bloquear robôs de treinamento de IA',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Ligado: o robots.txt ganha um bloco "Disallow: /" para cada robô que coleta páginas para treinar modelos (GPTBot, ClaudeBot, CCBot, Google-Extended, PerplexityBot e outros). Esses blocos são acrescentados sozinhos ao servir o arquivo: não aparecem em "Regras extras"; veja o resultado na pré-visualização abaixo. Não afeta o Google Search nem assistentes que buscam a página a pedido do usuário. Sem efeito com a indexação bloqueada (já fecha tudo).',
              },
            },
            {
              name: 'robotsExtra',
              label: 'Regras extras do robots.txt',
              type: 'textarea',
              validate: robotsRules,
              admin: {
                rows: 6,
                description:
                  'Uma regra por linha, só "Allow:" e "Disallow:" (ex.: Disallow: /busca/). Entram no bloco "User-agent: *", depois de "/next/" e "/api/". Linhas com # são comentários. Os bloqueios de robôs de IA não são escritos aqui.',
              },
            },
            {
              name: 'robotsPreview',
              type: 'ui',
              admin: { components: { Field: '@/components/admin/RobotsPreview#RobotsPreview' } },
            },
            {
              name: 'seoDefaultDescription',
              label: 'Descrição padrão',
              type: 'textarea',
              admin: {
                rows: 3,
                description:
                  'Usada em description, og:description e twitter:description quando a página não tem descrição própria. Até uns 155 caracteres.',
              },
            },
            {
              name: 'favicon',
              label: 'Favicon',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'PNG quadrado, no mínimo 48×48. Vazio: o favicon padrão da plataforma.',
              },
            },
            {
              name: 'appIcon',
              label: 'Ícone do app e logo da organização',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'PNG quadrado, 180×180. Vira o apple-touch-icon e o logo nos dados estruturados. Vazio: /icons/apple-touch-icon.png.',
              },
            },
            {
              name: 'manifestIcon',
              label: 'Ícone do manifest (instalação como app)',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'PNG quadrado, 512×512. Usado em /manifest.webmanifest como ícone de 192 e 512 px, que os navegadores exigem para oferecer a instalação do site como app. Vazio: só o ícone do app (180×180), sem instalação.',
              },
            },
          ],
        },
        {
          label: 'Rastreio',
          description:
            'Analytics e consentimento (LGPD). Nada é carregado no preview do admin; vazio: sem rastreio.',
          fields: [
            {
              name: 'tracking',
              label: 'Rastreio',
              type: 'group',
              fields: [
                {
                  name: 'gtmId',
                  label: 'ID do Google Tag Manager',
                  type: 'text',
                  validate: matches(/^GTM-[A-Z0-9]+$/, 'Formato: GTM-XXXXXXX'),
                  admin: { description: 'Ex.: GTM-ABC1234. Carregado depois da interação.' },
                },
                {
                  name: 'ga4Id',
                  label: 'ID de medição do GA4',
                  type: 'text',
                  validate: matches(/^G-[A-Z0-9]+$/, 'Formato: G-XXXXXXXXXX'),
                  admin: {
                    description:
                      'Ex.: G-ABC123DEF4. Só é usado sem GTM (com GTM, configure o GA4 dentro do container, para não contar em dobro).',
                  },
                },
                {
                  name: 'consentBanner',
                  label: 'Mostrar banner de consentimento',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'Ligado: o rastreio começa negado (Consent Mode v2) e só é liberado se o visitante aceitar. Desligado: o rastreio carrega direto. Desligue se o GTM já traz a sua ferramenta de consentimento.',
                  },
                },
                {
                  name: 'privacyUrl',
                  label: 'Link da política de privacidade',
                  type: 'text',
                  admin: {
                    description: 'Mostrado no banner. Caminho (/privacidade) ou URL completa.',
                    condition: (_, siblingData) => Boolean(siblingData?.consentBanner),
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Empresa e redes',
          description:
            'Dados da empresa e redes sociais, usados nos dados estruturados (schema.org) de todas as páginas.',
          fields: [
            {
              name: 'company',
              label: 'Empresa',
              type: 'group',
              fields: [
                { name: 'legalName', label: 'Razão social', type: 'text' },
                { name: 'cnpj', label: 'CNPJ', type: 'text' },
                { name: 'address', label: 'Endereço', type: 'text' },
                {
                  name: 'sacPhone',
                  label: 'Telefone do SAC',
                  type: 'text',
                  admin: { description: 'Ex.: +55 11 4003-0000 ou 0800 000 0000.' },
                },
              ],
            },
            {
              // Mobile app of the property, listed in the structured data (SoftwareApplication).
              name: 'app',
              label: 'Aplicativo',
              type: 'group',
              admin: {
                description:
                  'Aplicativo da propriedade nos dados estruturados de todas as páginas. Sem nome ou sem links das lojas, nada é publicado.',
              },
              fields: [
                { name: 'name', label: 'Nome do aplicativo', type: 'text' },
                {
                  name: 'androidUrl',
                  label: 'Link na Google Play',
                  type: 'text',
                  validate: matches(/^(https?:\/\/.+)?$/, 'Use o endereço completo, com https://'),
                },
                {
                  name: 'iosUrl',
                  label: 'Link na App Store',
                  type: 'text',
                  validate: matches(/^(https?:\/\/.+)?$/, 'Use o endereço completo, com https://'),
                },
              ],
            },
            {
              name: 'socials',
              label: 'Redes sociais',
              type: 'array',
              maxRows: 10,
              fields: [
                {
                  name: 'network',
                  label: 'Rede',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'X (Twitter)', value: 'x' },
                    { label: 'TikTok', value: 'tiktok' },
                  ],
                },
                {
                  name: 'url',
                  label: 'Endereço do perfil',
                  type: 'text',
                  required: true,
                  validate: matches(/^https:\/\//, 'Use o endereço completo, com https://'),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [normalizeDomains],
    beforeChange: [validateUniqueDomains],
    // The site renders the tracking, company and social data of the property on every page.
    afterChange: [revalidateSite],
  },
}
