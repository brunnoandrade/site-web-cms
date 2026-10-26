import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

import { CategoryGroups, HelpBackBar } from '@/components/UberHelp'
import type { Faq } from '@digio/payload-types'

import { JsonLd } from '@/components/JsonLd'
import { RenderHero } from '@/heros/RenderHero'
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/jsonld'
import { requireTenant } from '@/lib/tenant'
import { buildMetadata } from '@/utilities/seo'
import {
  getCategoryGroups,
  getHelpCategory,
  categoryPath,
  getHelpPage,
  helpIndexHref,
  helpIndexLabel,
  isUberHelp,
  questionPath,
} from '@/lib/uber-help'

// The category comes in the query string (?slug=pix), like on the current site: the page is
// rendered per request.
type Args = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ slug?: string }>
}

export default async function HelpCategoryPage({ params, searchParams }: Args) {
  const tenant = await requireTenant((await params).tenant)
  if (!isUberHelp(tenant)) notFound()
  const { slug } = await searchParams
  if (!slug) redirect(helpIndexHref)

  const [category, page] = await Promise.all([
    getHelpCategory(tenant.slug, slug),
    getHelpPage(tenant.slug),
  ])
  if (!category) notFound()
  const groups = await getCategoryGroups(tenant.slug, category.id)

  return (
    <>
      {page && <RenderHero {...page.hero} />}
      <div className="bg-[#f3f3f3]">
        <HelpBackBar
          back={helpIndexHref}
          items={[{ label: helpIndexLabel, href: helpIndexHref }, { label: category.title }]}
        />
      </div>
      <CategoryGroups category={category} groups={groups} />
      <JsonLd
        data={[
          breadcrumbNode(tenant, [
            { name: 'Home', path: '/' },
            { name: 'Ajuda', path: helpIndexHref },
            { name: category.title },
          ]),
          webPageNode(tenant, {
            path: categoryPath(category.slug!),
            name: `Central de Ajuda: ${category.title}`,
            description: category.description,
            extra: {
              mainEntity: itemListNode(
                tenant,
                groups.flatMap((group) =>
                  (group.faqs ?? [])
                    .filter((faq): faq is Faq => typeof faq === 'object' && Boolean(faq.slug))
                    .map((faq) => ({ name: faq.question, path: questionPath(faq.slug!) })),
                ),
              ),
            },
          }),
        ]}
      />
    </>
  )
}

export async function generateMetadata({ params, searchParams }: Args): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  const { slug } = await searchParams
  const [category, page] = isUberHelp(tenant)
    ? await Promise.all([
        slug ? getHelpCategory(tenant.slug, slug) : null,
        getHelpPage(tenant.slug),
      ])
    : [null, null]
  return buildMetadata({
    tenant,
    path: category ? `${categoryPath(category.slug!)}` : helpIndexHref,
    title: category ? `Central de Ajuda: ${category.title}` : 'Central de Ajuda',
    description: category?.description ?? page?.meta?.description,
    keywords: page?.meta?.keywords,
    image: page?.meta?.image,
  })
}
