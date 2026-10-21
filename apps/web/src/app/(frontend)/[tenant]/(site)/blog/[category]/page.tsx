import type { Metadata } from 'next'
import { blogCategoryPath, postPath } from '@digio/routes'
import { permanentRedirect } from 'next/navigation'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { findOne } from '@/lib/cms'
import { requireCategory, requireTenant } from '@/lib/tenant'
import { isUberConta } from '@/lib/uber-help'

type Args = { params: Promise<{ tenant: string; category: string }> }

export function generateStaticParams() {
  return []
}

export default async function BlogCategory({ params }: Args) {
  const { tenant: tenantSlug, category: categorySlug } = await params
  const tenant = await requireTenant(tenantSlug)

  // Uber Conta posts live at /blog/<slug>/ on the current site: send them to the canonical URL.
  if (isUberConta(tenant)) {
    const post = await findOne('posts', {
      tenant: tenant.slug,
      depth: 1,
      where: { slug: { equals: decodeURIComponent(categorySlug) } },
    })
    const postCategory = typeof post?.category === 'object' ? post.category : null
    if (post && postCategory) permanentRedirect(postPath(postCategory.slug, post.slug!))
  }

  const category = await requireCategory(tenant.slug, categorySlug)

  return (
    <>
      <BlogListing category={category} page={1} tenant={tenant.slug} />
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, category: categorySlug } = await params
  const tenant = await requireTenant(tenantSlug)
  const category = await requireCategory(tenant.slug, categorySlug)
  return {
    title: `${category.title} | Blog | ${tenant.name}`,
    description: category.description ?? undefined,
    alternates: { canonical: `${tenant.siteUrl}${blogCategoryPath(category.slug)}` },
  }
}
