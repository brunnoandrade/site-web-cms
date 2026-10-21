import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { HelpBackBar, QuestionList } from '@/components/UberHelp'
import { RenderHero } from '@/heros/RenderHero'
import { requireTenant } from '@/lib/tenant'
import { getHelpPage, helpIndexLabel, isUberHelp, searchFaqs } from '@/lib/uber-help'

type Args = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function HelpSearchPage({ params, searchParams }: Args) {
  const tenant = await requireTenant((await params).tenant)
  if (!isUberHelp(tenant)) notFound()
  const query = ((await searchParams).q ?? '').trim()
  const [page, results] = await Promise.all([
    getHelpPage(tenant.slug),
    searchFaqs(tenant.slug, query),
  ])

  return (
    <>
      {page && <RenderHero {...page.hero} />}
      <div className="bg-[#f3f3f3]">
        <HelpBackBar
          back="/central-de-ajuda/"
          items={[{ label: helpIndexLabel, href: '/central-de-ajuda/' }, { label: 'Busca' }]}
        />
      </div>
      <section className="bg-[#f3f3f3] pb-24">
        <div className="container max-w-[960px]">
          <h1 className="mb-8 mt-0 text-2xl font-semibold">
            {query ? `Resultados para “${query}”` : 'Digite uma dúvida para buscar'}
          </h1>
          {query && results.length === 0 && (
            <p className="font-light text-[#4b4b4b]">
              Não encontramos nenhuma pergunta com esses termos. Tente outras palavras ou escolha uma
              categoria na <Link href="/central-de-ajuda/">Central de Ajuda</Link>.
            </p>
          )}
          {results.length > 0 && <QuestionList faqs={results} />}
        </div>
      </section>
    </>
  )
}

export async function generateMetadata({ params }: Pick<Args, 'params'>): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  return { title: `Busca | Central de Ajuda | ${tenant.name}`, robots: { index: false } }
}
