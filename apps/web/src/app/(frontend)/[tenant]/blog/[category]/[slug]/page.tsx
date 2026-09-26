import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { categorySlugOf, postPath } from '@digio/routes'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { PostHero } from '@/heros/PostHero'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'

// Rendered on the first request and cached per tenant (ISR); see [[...slug]]/page.tsx.
// URL: /blog/<categoria>/<slug>/, the same as WordPress.
export function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{
    tenant: string
    category: string
    slug: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { tenant: tenantSlug, category, slug } = await paramsPromise
  const tenant = await requireTenant(tenantSlug)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ tenant: tenant.slug, slug: decodedSlug })

  // Redirects are answered earlier, by the proxy (src/proxy.ts).
  if (!post) notFound()

  // Same post under another category: send to the canonical URL (as WordPress does).
  const postCategory = categorySlugOf(post.category)
  if (!postCategory) notFound()
  if (postCategory !== decodeURIComponent(category))
    permanentRedirect(postPath(postCategory, post.slug!))

  return (
    <article className="pt-16 pb-16">
      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await paramsPromise
  const tenant = await requireTenant(tenantSlug)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ tenant: tenant.slug, slug: decodedSlug })
  const postCategory = categorySlugOf(post?.category)

  return generateMeta({
    doc: post,
    tenant,
    path: postCategory && post?.slug ? postPath(postCategory, post.slug) : '/blog/',
  })
}

const queryPostBySlug = cache(async ({ tenant, slug }: { tenant: string; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  return findOne('posts', {
    tenant,
    draft,
    tags: [`posts_${slug}`],
    where: {
      slug: {
        equals: slug,
      },
    },
  })
})
