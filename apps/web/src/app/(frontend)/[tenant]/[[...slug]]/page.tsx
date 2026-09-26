import type { Metadata } from 'next'

import { pagePath } from '@digio/routes'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'

// Pages are rendered on the first request and cached per tenant (ISR), then refreshed by the
// CMS revalidation webhook. Nothing is prerendered at build time: the build has no CMS access.
export function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{
    tenant: string
    slug?: string[]
  }>
}

// Joins the catch-all segments; the root ('/') maps to the 'home' page.
const toPageSlug = (segments?: string[]) =>
  segments && segments.length > 0 ? segments.map(decodeURIComponent).join('/') : 'home'

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { tenant: tenantSlug, slug: segments } = await paramsPromise
  const tenant = await requireTenant(tenantSlug)
  const slug = toPageSlug(segments)
  const page = await queryPageBySlug({ tenant: tenant.slug, slug })

  // Redirects are answered earlier, by the proxy (src/proxy.ts).
  if (!page) notFound()

  const { hero, layout } = page

  return (
    <article>
      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} tenant={tenant.slug} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, slug: segments } = await paramsPromise
  const tenant = await requireTenant(tenantSlug)
  const slug = toPageSlug(segments)
  const page = await queryPageBySlug({ tenant: tenant.slug, slug })

  return generateMeta({ doc: page, tenant, path: pagePath(slug) })
}

const queryPageBySlug = cache(async ({ tenant, slug }: { tenant: string; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  return findOne('pages', {
    tenant,
    draft,
    tags: [`pages_${slug}`],
    where: {
      slug: {
        equals: slug,
      },
    },
  })
})
