'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import { documentPath } from '@digio/routes'
import React from 'react'

import type { Post } from '@digio/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'category' | 'meta' | 'title'>

/** Post card: the whole card is clickable, but only the title is a link (one tab stop per card). */
export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, category, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  // Posts need their category populated to have a URL (/blog/<categoria>/<slug>/).
  const href = (relationTo && documentPath(relationTo, { slug, category })) || '#'

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-card bg-white text-navy-900 shadow-[0_1px_0_#dde1f3] ring-1 ring-[#dde1f3] transition-shadow hover:cursor-pointer hover:shadow-lg',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-lilac-100">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
            resource={metaImage}
            size="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {showCategories && category && typeof category === 'object' && (
          <span className="self-start rounded-full bg-lilac-100 px-3 py-1 text-xs font-semibold text-brand-blue">
            {category.title}
          </span>
        )}
        {titleToUse && (
          <h3 className="text-lg font-semibold leading-snug">
            <Link className="focus-visible:underline group-hover:underline" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && <p className="line-clamp-3 text-sm text-ink-600">{sanitizedDescription}</p>}
      </div>
    </article>
  )
}
