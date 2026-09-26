import type { Post, ArchiveBlock as ArchiveBlockProps } from '@digio/payload-types'

import { find } from '@/lib/cms'
import React from 'react'
import RichText from '@/components/RichText'

import { Card } from '@/components/Card'
import { CMSLink } from '@/components/Link'
import { Section, isDarkTheme } from '@/components/Section'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
    tenant: string
  }
> = async (props) => {
  const {
    id,
    tenant,
    theme,
    enableMoreLink,
    moreLink,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
  } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await find('posts', {
      tenant,
      depth: 1,
      limit,
      sort: '-publishedAt',
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              category: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

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
