import type { Metadata } from 'next'

// Relative image URLs are resolved against the tenant's metadataBase ([tenant]/layout.tsx).
const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  images: [
    {
      url: '/website-template-OG.webp',
    },
  ],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
