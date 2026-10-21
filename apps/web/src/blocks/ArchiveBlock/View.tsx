import type { Post, ArchiveBlock as ArchiveBlockProps } from '@digio/payload-types'

import React from 'react'
import RichText from '@/components/RichText'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Card } from '@/components/Card'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { Section, isDarkTheme } from '@/components/Section'
import Link from 'next/link'
import { documentPath } from '@digio/routes'

import { BlogCarousel } from './BlogCarousel'
import type { FeedItem } from './feed'

export type ArchiveBlockViewProps = ArchiveBlockProps & {
  id?: string
  posts: Post[]
  /** External feed items (Medium): when present, the carousel shows them instead of `posts`. */
  feed?: FeedItem[]
}

/**
 * Uber Conta blog slide: photo on top (zooms on hover), grey area with a 2-line title and a blue
 * "Leia no Blog" link. The whole card is the link.
 */
const BlogSlide: React.FC<{
  title: string
  href: string
  image?: NonNullable<Post['meta']>['image'] | string | null
  external?: boolean
}> = ({ title, href, image, external }) => (
  <Link
    className="group block h-full overflow-hidden rounded-lg"
    href={href}
    {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
  >
    <span className="relative block h-[170px] w-full overflow-hidden bg-[#e8e8e8] min-[1400px]:h-[200px]">
      {typeof image === 'string' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-200 group-hover:scale-[1.16] motion-reduce:transition-none"
          loading="lazy"
          src={image}
        />
      ) : (
        image &&
        typeof image === 'object' && (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-200 group-hover:scale-[1.16] motion-reduce:transition-none"
            resource={image}
            size="280px"
          />
        )
      )}
    </span>
    <span className="block bg-[#f3f3f3] p-6">
      <h4 className="line-clamp-2 min-h-10 text-[1.3em] font-semibold leading-tight text-black">
        {title}
      </h4>
      <span className="mt-4 inline-flex items-center text-sm text-[#276ef1] group-hover:text-black">
        Leia no Blog
        <ArrowRightIcon className="-mt-0.5 ml-2 w-[15px]" />
      </span>
    </span>
  </Link>
)

/** Presentational part of the archive: no data fetching, so it also renders in the live preview. */
export const ArchiveBlockView: React.FC<ArchiveBlockViewProps> = (props) => {
  const {
    id,
    theme,
    variant,
    eyebrow,
    enableMoreLink,
    moreLink,
    introContent,
    posts,
    feed = [],
  } = props

  if (posts.length === 0 && feed.length === 0) return null
  const dark = isDarkTheme(theme)

  if (variant === 'carousel') {
    return (
      <Section id={`block-${id}`} theme={theme}>
        <div className="container grid gap-10 min-[992px]:grid-cols-3 min-[992px]:gap-6">
          <div>
            {eyebrow && <p className="mb-4 mt-0 font-normal text-[#4b4b4b]">{eyebrow}</p>}
            {introContent && (
              <RichText
                className="[&_h2]:text-[min(2.5rem,calc(1.375rem+1.5vw))] [&_h2]:font-semibold [&_h2]:leading-none"
                data={introContent}
                enableGutter={false}
              />
            )}
            {enableMoreLink && moreLink && (
              <CMSLink
                {...moreLink}
                appearance="secondary"
                className="mt-8 h-auto rounded-[0.6rem] bg-[#e8e8e8] px-[1.7rem] py-4 text-base font-normal text-black hover:bg-black/[0.08] min-[992px]:[&_svg]:hidden"
              >
                <ArrowRightIcon className="size-[15px]" />
              </CMSLink>
            )}
          </div>
          <div className="min-w-0 min-[992px]:col-span-2">
            <BlogCarousel label="Posts do blog">
              {feed.length > 0
                ? feed.map((item) => (
                    <BlogSlide
                      key={item.href}
                      external
                      href={item.href}
                      image={item.image}
                      title={item.title}
                    />
                  ))
                : posts.map((post) => (
                    <BlogSlide
                      key={post.id}
                      href={documentPath('posts', post) ?? '#'}
                      image={post.meta?.image}
                      title={post.title}
                    />
                  ))}
            </BlogCarousel>
          </div>
        </div>
      </Section>
    )
  }

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
