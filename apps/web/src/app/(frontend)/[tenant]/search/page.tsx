import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { find } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import React from 'react'
import { Search } from '@/search/Component'

// Results depend on the query string: never cache the rendered page.
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ params, searchParams: searchParamsPromise }: Args) {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)
  const { q: rawQuery } = await searchParamsPromise
  // Only a plain string: control characters (a NUL byte makes Postgres fail) and absurd lengths
  // never reach the CMS query.
  const query =
    typeof rawQuery === 'string'
      ? rawQuery
          .replace(/[\u0000-\u001f\u007f]/g, '')
          .trim()
          .slice(0, 100)
      : ''
  const results = await find('search', {
    tenant: tenant.slug,
    depth: 0,
    limit: 12,
    select: { doc: true },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  // The search index has no post URL: load the matching posts (with their category).
  const postIDs = results.docs
    .map((result) => result.doc.value)
    .filter((id) => typeof id === 'number')
  const posts =
    postIDs.length > 0
      ? await find('posts', {
          tenant: tenant.slug,
          depth: 1,
          limit: postIDs.length,
          where: { id: { in: postIDs } },
          select: { title: true, slug: true, category: true, meta: true },
        })
      : { docs: [], totalDocs: 0 }

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Pick<Args, 'params'>): Promise<Metadata> {
  const { tenant: tenantSlug } = await params
  const tenant = await requireTenant(tenantSlug)
  return {
    title: `Busca | ${tenant.name}`,
  }
}
