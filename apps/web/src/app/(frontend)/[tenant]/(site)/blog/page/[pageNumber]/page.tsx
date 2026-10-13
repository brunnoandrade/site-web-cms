import type { Metadata } from 'next'
import { blogPagePath } from '@digio/routes'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { parsePageNumber, requireTenant } from '@/lib/tenant'

type Args = { params: Promise<{ tenant: string; pageNumber: string }> }

export function generateStaticParams() {
  return []
}

export default async function BlogIndexPage({ params }: Args) {
  const { tenant, pageNumber } = await params
  const { slug } = await requireTenant(tenant)

  return (
    <>
      <BlogListing page={parsePageNumber(pageNumber)} tenant={slug} />
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tenant: tenantSlug, pageNumber } = await params
  const tenant = await requireTenant(tenantSlug)
  const page = parsePageNumber(pageNumber)
  return {
    title: `Blog, página ${page} | ${tenant.name}`,
    alternates: { canonical: `${tenant.siteUrl}${blogPagePath(page)}` },
  }
}
