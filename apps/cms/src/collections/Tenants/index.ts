import type { CollectionConfig } from 'payload'

import { anyone, getTenantIDsWithRoles, isSuperAdmin, superAdminOnly } from '../../access/roles'
import { normalizeDomains, validateUniqueDomains } from './hooks/domains'

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
        description: 'Identificador técnico (ex.: digio). Usado nas pastas de mídia e no cache.',
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
          if (url.pathname !== '/' || value.endsWith('/')) return 'Sem caminho nem barra no final.'
          return true
        } catch {
          return 'URL inválida.'
        }
      },
    },
    {
      // Visual identity of the property. Presets live in apps/web/src/lib/themes.ts.
      name: 'themePreset',
      label: 'Tema visual',
      type: 'select',
      defaultValue: 'digio',
      options: [
        { label: 'Digio (marinho e turquesa)', value: 'digio' },
        { label: 'Uber Conta (preto e azul)', value: 'uber-conta' },
      ],
      admin: {
        description: 'Paleta aplicada a todo o site da propriedade. Novos temas exigem um deploy.',
      },
    },
    {
      // Structure of the menu and footer. Layouts live in apps/web/src/layouts.
      name: 'layout',
      label: 'Layout do menu e rodapé',
      type: 'select',
      defaultValue: 'digio',
      options: [
        { label: 'Digio', value: 'digio' },
        { label: 'Uber Conta (mega menu)', value: 'uber-conta' },
      ],
      admin: {
        description: 'Estrutura visual do cabeçalho e do rodapé. Novos layouts exigem um deploy.',
      },
    },
    {
      // URL policy of the property (see packages/routes). It must match the URLs of the site being
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
        { label: 'Com categoria: /blog/<categoria>/<post>/ (padrão WordPress)', value: 'category' },
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
      // Search engine and social defaults of the property (page titles, share image).
      name: 'seoTitleSuffix',
      label: 'Sufixo do título das páginas (SEO)',
      type: 'text',
      admin: {
        description:
          'Anexado ao título de cada página no <title>. Ex.: " • Uber Conta". Vazio: " | <nome da propriedade>". Não vai para og:title nem twitter:title.',
      },
    },
    {
      name: 'seoDefaultImage',
      label: 'Imagem padrão de compartilhamento (SEO)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Usada em og:image e twitter:image quando a página não tem imagem própria (1200×630).',
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
    {
      // Fixed texts of the site's interface. Each one has a default in the website code: leave
      // empty to use it. Changing a text here changes it on every page of the property.
      name: 'uiTexts',
      label: 'Textos do site',
      type: 'group',
      admin: {
        description:
          'Textos fixos da interface (botões, rótulos, mensagens). Vazio: usa o texto padrão do site.',
      },
      fields: [
        {
          name: 'readMoreBlog',
          label: 'Link dos cartões do blog',
          type: 'text',
          admin: { placeholder: 'Leia no Blog' },
        },
        {
          name: 'relatedQuestions',
          label: 'Título dos cartões relacionados (pergunta)',
          type: 'text',
          admin: { placeholder: 'Assuntos relacionados' },
        },
        {
          name: 'helpTitle',
          label: 'Nome da central de ajuda (títulos e trilha)',
          type: 'text',
          admin: { placeholder: 'Central de Ajuda' },
        },
        {
          name: 'crumbHome',
          label: 'Trilha: início',
          type: 'text',
          admin: { placeholder: 'Home' },
        },
        {
          name: 'crumbHelp',
          label: 'Trilha: ajuda',
          type: 'text',
          admin: { placeholder: 'Ajuda' },
        },
        {
          name: 'searchPageTitle',
          label: 'Título da página de busca',
          type: 'text',
          admin: { placeholder: 'Busca' },
        },
        {
          name: 'searchSuggestions',
          label: 'Busca: título das sugestões',
          type: 'text',
          admin: { placeholder: 'Sugestões:' },
        },
        {
          name: 'searchNoResults',
          label: 'Busca: sem sugestões',
          type: 'text',
          admin: { placeholder: 'Nenhuma sugestão encontrada' },
        },
        {
          name: 'searchClear',
          label: 'Busca: botão de limpar (leitor de tela)',
          type: 'text',
          admin: { placeholder: 'Limpar busca' },
        },
        {
          name: 'popularSearches',
          label: 'Busca: termos populares (mostrados ao clicar na caixa vazia)',
          type: 'array',
          maxRows: 8,
          fields: [{ name: 'term', label: 'Termo', type: 'text', required: true }],
        },
      ],
    },
    {
      // The app of the property, listed in the structured data (schema.org) of every page.
      name: 'app',
      label: 'Aplicativo (dados estruturados)',
      type: 'group',
      admin: {
        description:
          'Aparece nos dados estruturados de todas as páginas. Sem nome e sem links das lojas, o aplicativo não é listado.',
      },
      fields: [
        { name: 'name', label: 'Nome do aplicativo', type: 'text' },
        { name: 'androidUrl', label: 'Link na Google Play', type: 'text' },
        { name: 'iosUrl', label: 'Link na App Store', type: 'text' },
        {
          name: 'organizationLogo',
          label: 'Logo da empresa (quadrado, 180×180)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Usado nos dados estruturados da organização. Vazio: /icons/apple-touch-icon.png.',
          },
        },
      ],
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
  hooks: {
    beforeValidate: [normalizeDomains],
    beforeChange: [validateUniqueDomains],
  },
}
