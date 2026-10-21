import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

import { CategoryGroups, HelpBackBar } from '@/components/UberHelp'
import { RenderHero } from '@/heros/RenderHero'
import { requireTenant } from '@/lib/tenant'
import {
  getCategoryGroups,
  getHelpCategory,
  getHelpPage,
  helpIndexLabel,
  isUberHelp,
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
  if (!slug) redirect('/central-de-ajuda/')

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
          back="/central-de-ajuda/"
          items={[{ label: helpIndexLabel, href: '/central-de-ajuda/' }, { label: category.title }]}
        />
      </div>
      <CategoryGroups category={category} groups={groups} />
    </>
  )
}

export async function generateMetadata({ params, searchParams }: Args): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  const { slug } = await searchParams
  const category = slug && isUberHelp(tenant) ? await getHelpCategory(tenant.slug, slug) : null
  return {
    title: category ? `${category.title} | Central de Ajuda | ${tenant.name}` : `Central de Ajuda | ${tenant.name}`,
    description: category?.description ?? undefined,
  }
}
