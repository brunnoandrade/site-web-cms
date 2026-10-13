import type { Metadata } from 'next'
import { helpIndexPath, helpQuestionPath, helpTopicPath } from '@digio/routes'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import RichText from '@/components/RichText'
import { requireHelpTopic, topicQuestions } from '@/lib/help'
import { requireTenant } from '@/lib/tenant'

type Args = { params: Promise<{ tenant: string; topic: string }> }

export function generateStaticParams() {
  return []
}

export default async function HelpTopicPage({ params }: Args) {
  const { tenant: tenantSlug, topic: topicSlug } = await params
  const tenant = await requireTenant(tenantSlug)
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
  const topic = await requireHelpTopic(tenant.slug, topicSlug)
  return {
    title: `${topic.title} | Central de Ajuda | ${tenant.name}`,
    description: topic.summary ?? undefined,
    alternates: { canonical: `${tenant.siteUrl}${helpTopicPath(topic.slug)}` },
  }
}
