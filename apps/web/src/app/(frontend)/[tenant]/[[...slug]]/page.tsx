import type { Post } from '@digio/payload-types'
import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { pathsOf } from '@/lib/urlStyle'
import { generateMeta } from '@/utilities/generateMeta'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { getArchivePosts, pickedPosts } from '@/blocks/ArchiveBlock/data'
import { SiteChrome } from '@/components/SiteChrome'
import { LivePreviewPage } from '@/components/LivePreviewPage'

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

  const { hero, layout, template } = page
  const bare = template === 'landing'
  // The dark hero pulls itself up under the fixed header (-mt-24); without a header it would be
  // cut off at the top, so a bare page gives it the space back.
  const heroOffset = bare && hero?.type === 'brand' ? 'pt-24' : undefined

  if (draft) {
    const archivePosts: Record<string, Post[]> = {}
    await Promise.all(
      layout.map(async (block) => {
        if (block.blockType !== 'archive' || !block.id) return
        archivePosts[block.id] = await getArchivePosts({ ...block, tenant: tenant.slug }).catch(
          () => pickedPosts(block.selectedDocs),
        )
      }),
    )

    return (
      <SiteChrome tenant={tenant.slug} bare={bare}>
        <article className={heroOffset}>
          <LivePreviewPage initialData={page} tenant={tenant.slug} archivePosts={archivePosts} />
        </article>
      </SiteChrome>
    )
  }

  return (
    <SiteChrome tenant={tenant.slug} bare={bare}>
      <article className={heroOffset}>
        {template !== 'noHero' && <RenderHero {...hero} />}
        <RenderBlocks blocks={layout} tenant={tenant.slug} archive={ArchiveBlock} />
      </article>
    </SiteChrome>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, slug: segments } = await paramsPromise
  const tenant = await requireTenant(tenantSlug)
  const slug = toPageSlug(segments)
  const page = await queryPageBySlug({ tenant: tenant.slug, slug })

  return generateMeta({ doc: page, tenant, path: pathsOf(tenant).page(slug) })
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
