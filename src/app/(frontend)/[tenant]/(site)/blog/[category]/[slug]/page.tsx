import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { PostPage, postMetadata } from '@/components/PostPage'
import { requireTenant } from '@/lib/tenant'
import { pathsOf, styleOf } from '@/lib/urlStyle'

// Rendered on the first request and cached per tenant (ISR); see [[...slug]]/page.tsx.
// URL: /blog/<categoria>/<slug>/, the same as WordPress (flat properties redirect to /blog/<slug>).
export function generateStaticParams() {
  return []
}

type Args = { params: Promise<{ tenant: string; category: string; slug: string }> }

export default async function Post({ params }: Args) {
  const { tenant: tenantSlug, category, slug } = await params
  const tenant = await requireTenant(tenantSlug)
  const decodedSlug = decodeURIComponent(slug)

  // Flat blog (e.g. Uber Conta): the category is not part of the URL.
  if (styleOf(tenant).flatPosts) permanentRedirect(pathsOf(tenant).post(category, decodedSlug))

  return (
    <PostPage category={decodeURIComponent(category)} slug={decodedSlug} tenant={tenant.slug} />
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tenant, slug } = await params
  return postMetadata({ tenant, slug: decodeURIComponent(slug) })
}
