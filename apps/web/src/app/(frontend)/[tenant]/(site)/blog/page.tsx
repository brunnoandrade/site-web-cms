import type { Metadata } from 'next'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { pathsOf, styleOf } from '@/lib/urlStyle'

type Args = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ categoria?: string; page?: string }>
}

const pageOf = (value?: string) => {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 ? n : 1
}

// Rendered on the first request and cached per tenant (ISR), refreshed by the 'posts' tag.
// A flat blog (Uber Conta) filters and paginates through the query string (?categoria=, ?page=),
// so its listing is rendered per request.
export default async function BlogIndex({ params, searchParams }: Args) {
  const tenant = await requireTenant((await params).tenant)

  if (!styleOf(tenant).flatPosts) {
    return <BlogListing page={1} tenant={tenant.slug} />
  }

  const { categoria, page } = await searchParams
  const category = categoria
    ? await findOne('categories', { tenant: tenant.slug, where: { slug: { equals: categoria } } })
    : null
  return <BlogListing category={category ?? undefined} page={pageOf(page)} tenant={tenant.slug} />
}

export async function generateMetadata({ params, searchParams }: Args): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  const paths = pathsOf(tenant)
  if (!styleOf(tenant).flatPosts) {
    return {
      title: `Blog | ${tenant.name}`,
      alternates: { canonical: `${tenant.siteUrl}${paths.blogIndex()}` },
    }
  }
  // Filtered and paginated listings are their own canonical URLs.
  const { categoria, page } = await searchParams
  return {
    title: `Blog | ${tenant.name}`,
    alternates: { canonical: `${tenant.siteUrl}${paths.blogPage(pageOf(page), categoria)}` },
  }
}
