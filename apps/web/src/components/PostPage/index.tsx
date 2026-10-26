import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { categorySlugOf } from '@digio/routes'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { PostHero } from '@/heros/PostHero'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { pathsOf } from '@/lib/urlStyle'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { JsonLd } from '@/components/JsonLd'
import { UberPost } from '@/components/UberPost'
import { blogPostingNode, breadcrumbNode, webPageNode } from '@/lib/jsonld'
import { collapse, lexicalText } from '@/utilities/seo'
import { isUberConta } from '@/lib/uber-help'

export const queryPostBySlug = cache(async ({ tenant, slug }: { tenant: string; slug: string }) => {
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

/**
 * A blog post, whatever URL form the property uses: /blog/<categoria>/<slug>/ (WordPress) or the
 * flat /blog/<slug>. `category` is the category segment of the URL when it has one; a post
 * requested under another category goes to its canonical URL.
 */
export async function PostPage({
  tenant: tenantSlug,
  slug,
  category,
}: {
  tenant: string
  slug: string
  category?: string
}) {
  const { isEnabled: draft } = await draftMode()
  const tenant = await requireTenant(tenantSlug)
  const post = await queryPostBySlug({ tenant: tenant.slug, slug })

  // Redirects are answered earlier, by the proxy (src/proxy.ts).
  if (!post) notFound()

  // Same post under another URL: send to the canonical one (as WordPress does).
  const postCategory = categorySlugOf(post.category)
  if (!postCategory) notFound()
  const canonical = pathsOf(tenant).post(postCategory, post.slug!)
  if (category !== undefined && canonical !== pathsOf(tenant).post(category, post.slug!)) {
    permanentRedirect(canonical)
  }

  if (isUberConta(tenant)) {
    return (
      <>
        {draft && <LivePreviewListener />}
        <UberPost post={post} tenant={tenant.slug} />
        <JsonLd
          data={[
            breadcrumbNode(
              tenant,
              [
                { name: 'Home', path: '/' },
                { name: 'Blog', path: pathsOf(tenant).blogIndex() },
                ...(typeof post.category === 'object' && post.category
                  ? [
                      {
                        name: post.category.title,
                        path: pathsOf(tenant).blogPage(1, post.category.slug),
                      },
                    ]
                  : []),
                { name: post.title, path: canonical },
              ],
              `${tenant.siteUrl}${canonical}#breadcrumb`,
            ),
            webPageNode(tenant, {
              path: canonical,
              name: post.title,
              description: post.meta?.description,
              extra: {
                '@id': `${tenant.siteUrl}${canonical}#webpage`,
                datePublished: post.publishedAt,
                dateModified: post.updatedAt,
              },
            }),
            blogPostingNode(
              tenant,
              post,
              canonical,
              collapse(lexicalText((post.content as { root?: unknown })?.root)),
            ),
          ]}
        />
      </>
    )
  }

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

export async function postMetadata({
  tenant: tenantSlug,
  slug,
}: {
  tenant: string
  slug: string
}): Promise<Metadata> {
  const tenant = await requireTenant(tenantSlug)
  const post = await queryPostBySlug({ tenant: tenant.slug, slug })
  const postCategory = categorySlugOf(post?.category)

  return generateMeta({
    doc: post,
    tenant,
    type: 'article',
    path:
      postCategory && post?.slug
        ? pathsOf(tenant).post(postCategory, post.slug)
        : pathsOf(tenant).blogIndex(),
  })
}
