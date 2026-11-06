/**
 * Public data of each property that the CMS keeps in "Propriedades": analytics, company, social
 * networks, default description, icons. Taken from the current sites (digio.com.br and
 * ubercontabrasil.com.br: footer, page head and scripts). Safe to run again; run it after the
 * content seed, which recreates each property's media.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'

const assetsDir = fileURLToPath(new URL('./tenant-assets', import.meta.url))

const company = {
  legalName: 'Banco Digio S.A.',
  cnpj: '27.098.060/0001-45',
  address: 'Avenida Alphaville, 779, 9º andar, Alphaville/SP',
}

type Profile = {
  slug: string
  tracking: { gtmId: string; privacyUrl?: string }
  sacPhone: string
  seoDefaultDescription: string
  socials: {
    network: 'instagram' | 'linkedin' | 'youtube' | 'facebook' | 'x' | 'tiktok'
    url: string
  }[]
  favicon: { file: string; alt: string }
  appIcon?: { file: string; alt: string }
}

export const tenantProfiles: Profile[] = [
  {
    slug: 'digio',
    tracking: { gtmId: 'GTM-536PM49' },
    // SAC Digio (the number the Uber Conta pages list for the bank).
    sacPhone: '0800 333 8735',
    seoDefaultDescription:
      'Cartão, conta, empréstimos e investimentos. Um banco completo, feito para você! Peça já seu cartão de crédito sem anuidade. É banco. É digital. É Bradesco!',
    socials: [
      { network: 'instagram', url: 'https://www.instagram.com/meudigio/' },
      { network: 'facebook', url: 'https://www.facebook.com/meudigio/' },
      { network: 'x', url: 'https://twitter.com/meudigio' },
      { network: 'linkedin', url: 'https://www.linkedin.com/company/digiobrasil/' },
      { network: 'youtube', url: 'https://www.youtube.com/channel/UCKNA3NI0z6PscBzFXDqAwfQ' },
      { network: 'tiktok', url: 'https://www.tiktok.com/@meudigio' },
    ],
    favicon: { file: 'digio-favicon.png', alt: 'Favicon do Digio' },
    appIcon: { file: 'digio-app-icon.png', alt: 'Ícone do app Digio' },
  },
  {
    slug: 'uber-conta',
    tracking: {
      gtmId: 'GTM-PFPD9ZJ',
      privacyUrl: 'https://ubercontabrasil.com.br/uploads/politica_de_privacidade_72b4fbbbbc.pdf',
    },
    // Central Uber Conta, 24 h (demais regiões).
    sacPhone: '0800 721 9907',
    seoDefaultDescription:
      'Plataforma financeira integrada para motoristas e usuários, com soluções de conta digital, cartão, empréstimos, benefícios e serviços inteligentes.',
    // The only network listed on the current site is Medium, which the CMS does not offer.
    socials: [],
    favicon: { file: 'uber-conta-favicon.png', alt: 'Favicon da Uber Conta' },
  },
]

async function mediaFor(payload: Payload, tenant: number, file: string, alt: string) {
  const { docs } = await payload.find({
    collection: 'media',
    where: {
      and: [{ filename: { contains: file.replace('.png', '') } }, { tenant: { equals: tenant } }],
    },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) return docs[0].id
  const data = await readFile(path.join(assetsDir, file))
  const media = await payload.create({
    collection: 'media',
    data: { alt, tenant },
    file: { name: file, data, mimetype: 'image/png', size: data.byteLength },
  })
  return media.id
}

export const seedTenantProfiles = async (payload: Payload) => {
  for (const profile of tenantProfiles) {
    const { docs } = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: profile.slug } },
      limit: 1,
      depth: 0,
    })
    const tenant = docs[0]
    if (!tenant) throw new Error(`Tenant ${profile.slug} not found`)

    await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        tracking: { ...profile.tracking, consentBanner: false },
        company: { ...company, sacPhone: profile.sacPhone },
        socials: profile.socials,
        seoDefaultDescription: profile.seoDefaultDescription,
        favicon: await mediaFor(payload, tenant.id, profile.favicon.file, profile.favicon.alt),
        ...(profile.appIcon
          ? {
              appIcon: await mediaFor(
                payload,
                tenant.id,
                profile.appIcon.file,
                profile.appIcon.alt,
              ),
            }
          : {}),
      },
    })
    payload.logger.info(`Tenant profile applied: ${profile.slug}`)
  }
}
