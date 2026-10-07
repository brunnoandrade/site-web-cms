import type { Post, ArchiveBlock as ArchiveBlockProps } from '@digio/payload-types'

import React from 'react'
import RichText from '@/components/RichText'

import { Card } from '@/components/Card'
import { CMSLink } from '@/components/Link'
import { Section, isDarkTheme } from '@/components/Section'

export type ArchiveBlockViewProps = ArchiveBlockProps & {
  id?: string
  posts: Post[]
}

/** Presentational part of the archive: no data fetching, so it also renders in the live preview. */
export const ArchiveBlockView: React.FC<ArchiveBlockViewProps> = (props) => {
  const { id, theme, enableMoreLink, moreLink, introContent, posts } = props

  if (posts.length === 0) return null
  const dark = isDarkTheme(theme)

  // Title and "see all" on the left, the latest posts on the right (Uber Conta blog layout).
  return (
    <Section id={`block-${id}`} theme={theme}>
      <div className="container grid gap-10 lg:grid-cols-[1fr_3fr] lg:gap-12">
        <div>
          {introContent && (
            <RichText
              className="[&_h2]:text-3xl [&_h2]:md:text-title"
              data={introContent}
              enableGutter={false}
            />
          )}
          {enableMoreLink && moreLink && (
            <CMSLink {...moreLink} appearance={dark ? 'inverse' : 'default'} className="mt-6" />
          )}
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Card className="h-full" doc={post} relationTo="posts" showCategories />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
