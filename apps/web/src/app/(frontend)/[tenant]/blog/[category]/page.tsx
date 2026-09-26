import type { Metadata } from 'next'
import { blogCategoryPath } from '@digio/routes'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { requireCategory, requireTenant } from '@/lib/tenant'

type Args = { params: Promise<{ tenant: string; category: string }> }

export function generateStaticParams() {
  return []
}

export default async function BlogCategory({ params }: Args) {
  const { tenant: tenantSlug, category: categorySlug } = await params
  const tenant = await requireTenant(tenantSlug)
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
