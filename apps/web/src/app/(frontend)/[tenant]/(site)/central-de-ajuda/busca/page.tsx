import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { HelpBackBar, QuestionList } from '@/components/UberHelp'
import { RenderHero } from '@/heros/RenderHero'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { uiTextsOf } from '@/lib/uiTexts'
import { buildMetadata } from '@/utilities/seo'
import { getHelpPage, helpIndexHref, isUberHelp, searchFaqs } from '@/lib/uber-help'

// Reads the query string, so it is rendered per request; CMS data stays cached by the fetch tags.
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function HelpSearchPage({ params, searchParams }: Args) {
  const tenant = await requireTenant((await params).tenant)
  if (!isUberHelp(tenant)) notFound()
  const query = ((await searchParams).q ?? '').trim()
  const texts = uiTextsOf(tenant)
  const [page, results] = await Promise.all([
    getHelpPage(tenant.slug),
    searchFaqs(tenant.slug, query),
  ])

  return (
    <>
      {page && <RenderHero {...page.hero} />}
      <div className="bg-[#f3f3f3]">
        <HelpBackBar
          back={helpIndexHref}
          items={[
            { label: texts.crumbHelp, href: helpIndexHref },
            { label: texts.searchPageTitle },
          ]}
        />
      </div>
      <section className="bg-[#f3f3f3] pb-24">
        <div className="container max-w-[960px]">
          <h1 className="mb-8 mt-0 text-2xl font-semibold">
            {query ? `Resultados para “${query}”` : 'Digite uma dúvida para buscar'}
          </h1>
          {query && results.length === 0 && (
            <p className="font-light text-[#4b4b4b]">
              Não encontramos nenhuma pergunta com esses termos. Tente outras palavras ou escolha
              uma categoria na <Link href={helpIndexHref}>{texts.helpTitle}</Link>.
            </p>
          )}
          {results.length > 0 && <QuestionList faqs={results} />}
        </div>
      </section>
    </>
  )
}

export async function generateMetadata({ params, searchParams }: Args): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  const query = ((await searchParams).q ?? '').trim()
  const home = await findOne('pages', { tenant: tenant.slug, where: { slug: { equals: 'home' } } })
  return buildMetadata({
    tenant,
    path: `${helpIndexHref}/busca${query ? `?q=${encodeURIComponent(query)}` : ''}`,
    title: uiTextsOf(tenant).searchPageTitle,
    description: home?.meta?.title,
    image: home?.meta?.image,
    noindex: true,
  })
}
