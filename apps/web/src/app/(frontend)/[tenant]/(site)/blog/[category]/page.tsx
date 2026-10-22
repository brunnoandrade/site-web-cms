import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { PostPage, postMetadata, queryPostBySlug } from '@/components/PostPage'
import { findOne } from '@/lib/cms'
import { requireCategory, requireTenant } from '@/lib/tenant'
import { pathsOf, styleOf } from '@/lib/urlStyle'

type Args = { params: Promise<{ tenant: string; category: string }> }

export function generateStaticParams() {
  return []
}

/**
 * /blog/<segment>/. With categories in the URL it is a category page. On a flat blog it is a
 * post (/blog/<slug>); the old category page URL goes to the filtered listing.
 */
export default async function BlogCategory({ params }: Args) {
  const { tenant: tenantSlug, category: segment } = await params
  const tenant = await requireTenant(tenantSlug)
  const slug = decodeURIComponent(segment)

  if (styleOf(tenant).flatPosts) {
    if (await queryPostBySlug({ tenant: tenant.slug, slug })) {
      return <PostPage slug={slug} tenant={tenant.slug} />
    }
    const category = await findOne('categories', {
      tenant: tenant.slug,
      where: { slug: { equals: slug } },
    })
    if (category) permanentRedirect(pathsOf(tenant).blogCategory(category.slug))
    notFound()
  }

  const category = await requireCategory(tenant.slug, segment)

  return (
    <>
      <BlogListing category={category} page={1} tenant={tenant.slug} />
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, category: segment } = await params
  const tenant = await requireTenant(tenantSlug)

  if (styleOf(tenant).flatPosts) {
    return postMetadata({ tenant: tenant.slug, slug: decodeURIComponent(segment) })
  }

  const category = await requireCategory(tenant.slug, segment)
  return {
    title: `${category.title} | Blog | ${tenant.name}`,
    description: category.description ?? undefined,
    alternates: { canonical: `${tenant.siteUrl}${pathsOf(tenant).blogCategory(category.slug)}` },
  }
}
