import type { Metadata } from 'next'
import React from 'react'

import { BlogListing } from '@/components/BlogListing'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbNode, webPageNode } from '@/lib/jsonld'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { uiTextsOf } from '@/lib/uiTexts'
import { buildMetadata } from '@/utilities/seo'
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

  const blogPage = await findOne('pages', {
    tenant: tenant.slug,
    where: { slug: { equals: 'blog' } },
  })
  const path = pathsOf(tenant).blogIndex()
  const structuredData = (
    <JsonLd
      data={[
        breadcrumbNode(
          tenant,
          [
            { name: uiTextsOf(tenant).crumbHome, path: '/' },
            { name: 'Blog', path },
          ],
          `${tenant.siteUrl}${path}#breadcrumb`,
        ),
        webPageNode(tenant, {
          path,
          name: 'Blog',
          description: blogPage?.meta?.description,
          type: 'CollectionPage',
          extra: { '@id': `${tenant.siteUrl}${path}#webpage` },
        }),
        {
          '@type': 'Blog',
          '@id': `${tenant.siteUrl}${path}#blog`,
          url: `${tenant.siteUrl}${path}`,
          name: 'Blog',
          description: blogPage?.meta?.description,
          inLanguage: 'pt-BR',
        },
      ]}
    />
  )

  if (!styleOf(tenant).flatPosts) {
    return (
      <>
        <BlogListing page={1} tenant={tenant.slug} />
        {structuredData}
      </>
    )
  }

  const { categoria, page } = await searchParams
  const category = categoria
    ? await findOne('categories', { tenant: tenant.slug, where: { slug: { equals: categoria } } })
    : null
  return (
    <>
      <BlogListing category={category ?? undefined} page={pageOf(page)} tenant={tenant.slug} />
      {structuredData}
    </>
  )
}

export async function generateMetadata({ params, searchParams }: Args): Promise<Metadata> {
  const tenant = await requireTenant((await params).tenant)
  const paths = pathsOf(tenant)
  const page = await findOne('pages', { tenant: tenant.slug, where: { slug: { equals: 'blog' } } })
  // A flat blog filters and paginates through the query string: each listing is its own canonical URL.
  const { categoria, page: pageNumber } = styleOf(tenant).flatPosts
    ? await searchParams
    : { categoria: undefined, page: undefined }
  return buildMetadata({
    tenant,
    path: styleOf(tenant).flatPosts
      ? paths.blogPage(pageOf(pageNumber), categoria)
      : paths.blogIndex(),
    title: page?.meta?.title ?? 'Blog',
    description: page?.meta?.description,
    keywords: page?.meta?.keywords,
    image: page?.meta?.image,
  })
}
