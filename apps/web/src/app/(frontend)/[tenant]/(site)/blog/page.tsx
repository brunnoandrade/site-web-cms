import type { Metadata } from 'next'
import { blogIndexPath } from '@digio/routes'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { requireTenant } from '@/lib/tenant'

type Args = { params: Promise<{ tenant: string }> }

// Rendered on the first request and cached per tenant (ISR), refreshed by the 'posts' tag.
export default async function BlogIndex({ params }: Args) {
  const { tenant } = await params
  const { slug } = await requireTenant(tenant)

  return (
    <>
      <BlogListing page={1} tenant={slug} />
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  return {
    title: `Blog | ${tenant.name}`,
    alternates: { canonical: `${tenant.siteUrl}${blogIndexPath}` },
  }
}
