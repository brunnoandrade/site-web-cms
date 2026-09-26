import React from 'react'

import type { ProductHighlightBlock as ProductHighlightBlockProps } from '@digio/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export const ProductHighlightBlock: React.FC<ProductHighlightBlockProps> = ({
  product,
  imagePosition,
}) => {
  if (!product || typeof product !== 'object') return null

  return (
    <section className="container">
      <div
        className={cn(
          'grid items-center gap-8 md:grid-cols-2',
          imagePosition === 'left' && 'md:[&>*:first-child]:order-2',
        )}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold">{product.name}</h2>
          <p className="text-lg text-muted-foreground">{product.summary}</p>
          {product.benefits && product.benefits.length > 0 && (
            <ul className="list-disc pl-6">
              {product.benefits.map((benefit, i) => (
                <li key={benefit.id ?? i}>{benefit.text}</li>
              ))}
            </ul>
          )}
          {product.enableLink && (product.link?.url || product.link?.reference) ? (
            <div>
              <CMSLink {...product.link} size="lg" />
            </div>
          ) : null}
        </div>
        {product.image && typeof product.image === 'object' && (
          <Media resource={product.image} imgClassName="rounded" />
        )}
      </div>
    </section>
  )
}
