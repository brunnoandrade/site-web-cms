import type { Metadata } from 'next'
import { helpIndexPath, helpQuestionPath, helpTopicPath } from '@digio/routes'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import RichText from '@/components/RichText'
import { requireHelpTopic, topicQuestions } from '@/lib/help'
import { requireTenant } from '@/lib/tenant'

type Args = { params: Promise<{ tenant: string; topic: string; question: string }> }

export function generateStaticParams() {
  return []
}

const load = async ({ params }: Args) => {
  const { tenant: tenantSlug, topic: topicSlug, question: questionSlug } = await params
  const tenant = await requireTenant(tenantSlug)
  const topic = await requireHelpTopic(tenant.slug, topicSlug)
  const questions = topicQuestions(topic)
  const faq = questions.find((item) => item.slug === decodeURIComponent(questionSlug))
  if (!faq) notFound()
  return { tenant, topic, questions, faq }
}

export default async function HelpQuestionPage(args: Args) {
  const { topic, questions, faq } = await load(args)
  const others = questions.filter((item) => item.id !== faq.id)

  return (
    <div className="container pt-16 pb-24">
      <Breadcrumbs
        items={[
          { label: 'Central de Ajuda', href: helpIndexPath },
          { label: topic.title, href: helpTopicPath(topic.slug) },
          { label: faq.question },
        ]}
      />
      <article className="mt-6 max-w-3xl">
        <h1 className="mb-6 text-3xl font-semibold">{faq.question}</h1>
        <RichText data={faq.answer} enableGutter={false} />
      </article>

      {others.length > 0 && (
        <aside aria-labelledby="outras" className="mt-16 max-w-3xl">
          <h2 id="outras" className="mb-4 text-xl font-semibold">
            Outras dúvidas sobre {topic.title}
          </h2>
          <ul className="divide-y divide-border border-y border-border">
            {others.map((item) => (
              <li key={item.id}>
                <Link
                  className="block py-3 hover:underline"
                  href={helpQuestionPath(topic.slug, item.slug!)}
                >
                  {item.question}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}

export async function generateMetadata(args: Args): Promise<Metadata> {
  const { tenant, topic, faq } = await load(args)
  return {
    title: `${faq.question} | ${topic.title} | ${tenant.name}`,
    alternates: { canonical: `${tenant.siteUrl}${helpQuestionPath(topic.slug, faq.slug!)}` },
  }
}
