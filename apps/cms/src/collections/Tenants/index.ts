import type { CollectionConfig } from 'payload'

import { anyone, getTenantIDsWithRoles, isSuperAdmin, superAdminOnly } from '../../access/roles'
import { normalizeDomains, validateUniqueDomains } from './hooks/domains'

/**
 * A tenant is one web property (institutional site, campaign, landing page) with its own
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
