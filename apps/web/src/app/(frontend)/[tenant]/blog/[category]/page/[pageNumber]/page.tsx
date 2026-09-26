import type { Metadata } from 'next'
import { blogPagePath } from '@digio/routes'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { parsePageNumber, requireCategory, requireTenant } from '@/lib/tenant'

type Args = { params: Promise<{ tenant: string; category: string; pageNumber: string }> }

export function generateStaticParams() {
  return []
}

export default async function BlogCategoryPage({ params }: Args) {
  const { tenant: tenantSlug, category: categorySlug, pageNumber } = await params
  const tenant = await requireTenant(tenantSlug)
  const category = await requireCategory(tenant.slug, categorySlug)

  return (
    <>
      <BlogListing category={category} page={parsePageNumber(pageNumber)} tenant={tenant.slug} />
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, category: categorySlug, pageNumber } = await params
  const tenant = await requireTenant(tenantSlug)
  const category = await requireCategory(tenant.slug, categorySlug)
  const page = parsePageNumber(pageNumber)
  return {
    title: `${category.title}, página ${page} | Blog | ${tenant.name}`,
    alternates: { canonical: `${tenant.siteUrl}${blogPagePath(page, category.slug)}` },
  }
}
