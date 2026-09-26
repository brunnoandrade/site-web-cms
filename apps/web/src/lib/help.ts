import 'server-only'

import type { Faq, HelpTopic } from '@digio/payload-types'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { findOne } from './cms'

/** Help topic by slug (published, or draft in preview). Renders the 404 page when unknown. */
export const requireHelpTopic = cache(async (tenant: string, slug: string): Promise<HelpTopic> => {
  const { isEnabled: draft } = await draftMode()
  const topic = await findOne('help-topics', {
    tenant,
    draft,
    depth: 1,
    tags: ['help'],
    where: { slug: { equals: decodeURIComponent(slug) } },
  })
  if (!topic) notFound()
  return topic
})

/** Questions of a topic, in the order set by the editors. */
export const topicQuestions = (topic: HelpTopic): Faq[] =>
  (topic.faqs ?? []).filter((faq): faq is Faq => typeof faq === 'object' && Boolean(faq.slug))
