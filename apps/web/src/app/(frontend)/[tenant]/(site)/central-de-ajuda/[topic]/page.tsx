import type { Metadata } from 'next'
import { helpIndexPath, helpQuestionPath, helpTopicPath } from '@digio/routes'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import RichText from '@/components/RichText'
import { JsonLd } from '@/components/JsonLd'
import { QuestionArticle, HelpBackBar } from '@/components/UberHelp'
import { breadcrumbNode, qaPageNode } from '@/lib/jsonld'
import { requireHelpTopic, topicQuestions } from '@/lib/help'
import {
  categoryPath,
  getCategoryFaqs,
  getFaq,
  helpIndexHref,
  helpIndexLabel,
  isUberHelp,
  questionPath,
} from '@/lib/uber-help'
import { notFound } from 'next/navigation'
import { requireTenant } from '@/lib/tenant'
import { buildMetadata, collapse, lexicalText } from '@/utilities/seo'

type Args = { params: Promise<{ tenant: string; topic: string }> }

export function generateStaticParams() {
  return []
}

export default async function HelpTopicPage({ params }: Args) {
  const { tenant: tenantSlug, topic: topicSlug } = await params
  const tenant = await requireTenant(tenantSlug)

  // Uber Conta: the URL is the question itself (/central-de-ajuda/<pergunta>/).
  if (isUberHelp(tenant)) {
    const faq = await getFaq(tenant.slug, decodeURIComponent(topicSlug))
    if (!faq) notFound()
    const category = typeof faq.category === 'object' ? faq.category : null
    const related = category
      ? (await getCategoryFaqs(tenant.slug, category.id)).filter(
          (item) => item.id !== faq.id && item.slug,
        )
      : []
    return (
      <>
        <HelpBackBar
          back={category ? categoryPath(category.slug!) : helpIndexHref}
          items={[
            { label: helpIndexLabel, href: helpIndexHref },
            ...(category ? [{ label: category.title, href: categoryPath(category.slug!) }] : []),
            { label: faq.question },
          ]}
        />
        <QuestionArticle faq={faq} related={related} />
        <JsonLd
          data={[
            breadcrumbNode(tenant, [
              { name: 'Home', path: '/' },
              { name: helpIndexLabel, path: helpIndexHref },
              ...(category ? [{ name: category.title, path: categoryPath(category.slug!) }] : []),
              { name: faq.question },
            ]),
            qaPageNode(tenant, faq, questionPath(faq.slug!)),
          ]}
        />
      </>
    )
  }

  const topic = await requireHelpTopic(tenant.slug, topicSlug)
  const questions = topicQuestions(topic)

  return (
    <div className="container pt-16 pb-24">
      <Breadcrumbs
        items={[{ label: 'Central de Ajuda', href: helpIndexPath }, { label: topic.title }]}
      />
      <h1 className="mt-6 mb-4 text-4xl font-semibold">{topic.title}</h1>
      {topic.summary && <p className="mb-8 text-lg text-muted-foreground">{topic.summary}</p>}
      {topic.content && <RichText className="mb-8" data={topic.content} enableGutter={false} />}

      {questions.length > 0 && (
        <section aria-labelledby="perguntas">
          <h2 id="perguntas" className="mb-4 text-2xl font-semibold">
            Dúvidas sobre {topic.title}
          </h2>
          <ul className="divide-y divide-border border-y border-border">
            {questions.map((faq) => (
              <li key={faq.id}>
                <Link
                  className="block py-4 hover:underline"
                  href={helpQuestionPath(topic.slug, faq.slug!)}
                >
                  {faq.question}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, topic: topicSlug } = await params
  const tenant = await requireTenant(tenantSlug)
  if (isUberHelp(tenant)) {
    const faq = await getFaq(tenant.slug, decodeURIComponent(topicSlug))
    return buildMetadata({
      tenant,
      path: questionPath(decodeURIComponent(topicSlug)),
      title: faq?.question,
      // The start of the answer, as the current site does.
      description: faq
        ? collapse(lexicalText((faq.answer as { root?: unknown })?.root)).slice(0, 160)
        : undefined,
    })
  }
  const topic = await requireHelpTopic(tenant.slug, topicSlug)
  return {
    title: `${topic.title} | Central de Ajuda | ${tenant.name}`,
    description: topic.summary ?? undefined,
    alternates: { canonical: `${tenant.siteUrl}${helpTopicPath(topic.slug)}` },
  }
}
