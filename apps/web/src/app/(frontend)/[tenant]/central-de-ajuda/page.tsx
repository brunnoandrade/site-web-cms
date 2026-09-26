import type { Metadata } from 'next'
import { helpIndexPath, helpTopicPath } from '@digio/routes'
import Link from 'next/link'
import React from 'react'

import { find } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'

type Args = { params: Promise<{ tenant: string }> }

// Rendered on the first request and cached per tenant (ISR), refreshed by the 'help' tag.
export default async function HelpCenter({ params }: Args) {
  const tenant = await requireTenant((await params).tenant)

  const [categories, topics] = await Promise.all([
    find('help-categories', { tenant: tenant.slug, limit: 100, sort: 'order', tags: ['help'] }),
    find('help-topics', {
      tenant: tenant.slug,
      depth: 0,
      limit: 200,
      sort: 'order',
      tags: ['help'],
      select: { title: true, slug: true, summary: true, category: true },
    }),
  ])

  const topicsOf = (categoryID: number) =>
    topics.docs.filter((topic) => topic.category === categoryID)

  return (
    <div className="container pt-16 pb-24">
      <h1 className="mb-4 text-4xl font-semibold">Central de Ajuda</h1>
      <p className="mb-12 text-lg text-muted-foreground">
        Selecione um tema para ver as dúvidas mais comuns.
      </p>

      {categories.docs.map((category) => {
        const items = topicsOf(category.id)
        if (items.length === 0) return null
        return (
          <section
            key={category.id}
            aria-labelledby={`categoria-${category.slug}`}
            className="mb-12"
          >
            <h2 id={`categoria-${category.slug}`} className="mb-4 text-2xl font-semibold">
              {category.title}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((topic) => (
                <li key={topic.id}>
                  <Link
                    className="block h-full rounded border border-border bg-card p-4 hover:border-primary"
                    href={helpTopicPath(topic.slug)}
                  >
                    <span className="block font-medium">{topic.title}</span>
                    {topic.summary && (
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {topic.summary}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  return {
    title: `Central de Ajuda | ${tenant.name}`,
    description: 'Tire suas dúvidas sobre cartão, conta, Pix e outros serviços.',
    alternates: { canonical: `${tenant.siteUrl}${helpIndexPath}` },
  }
}
