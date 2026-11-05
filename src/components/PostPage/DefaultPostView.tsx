import React from 'react'

import type { Post } from '@/payload-types'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import RichText from '@/components/RichText'
import { PostHero } from '@/heros/PostHero'

/** Post of the default layout (Digio). No server-only imports: it also renders in the live preview. */
export const DefaultPostView: React.FC<{ post: Post }> = ({ post }) => (
  <article className="pt-16 pb-16">
    <PostHero post={post} />

    <div className="flex flex-col items-center gap-4 pt-8">
      <div className="container">
        <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <RelatedPosts
            className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
            docs={post.relatedPosts.filter((post) => typeof post === 'object')}
          />
        )}
      </div>
    </div>
  </article>
)
