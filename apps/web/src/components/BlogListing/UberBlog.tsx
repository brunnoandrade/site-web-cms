import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Category, Post } from '@digio/payload-types'
import type { paths } from '@digio/routes'

import { Pagination } from '@/components/Pagination'
import { Picture } from '@/components/Picture'
import { RenderHero } from '@/heros/RenderHero'
import { cn } from '@/utilities/ui'

type Props = {
  /** URLs of the property (see packages/routes). */
  urls: ReturnType<typeof paths>
  hero?: React.ComponentProps<typeof RenderHero>
  categories: Category[]
  current?: Category
  posts: Pick<Post, 'id' | 'slug' | 'title' | 'category' | 'meta'>[]
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}

/** Uber Conta blog: hero, category chips ("Todos" first) and a three-column grid of article cards. */
export const UberBlog: React.FC<Props> = ({
  urls,
  hero,
  categories,
  current,
  posts,
  page,
  totalPages,
  hrefFor,
}) => {
  const chip = (active: boolean) =>
    cn(
      'inline-block rounded-[0.6rem] border border-transparent px-5 py-2 text-base leading-normal transition-colors motion-reduce:transition-none',
      active ? 'bg-black text-white' : 'bg-[#e8e8e8] text-black hover:bg-[#d6d6d6]',
    )

  return (
    <>
      {hero && <RenderHero {...hero} />}
      <section className="pb-10 pt-10">
        <div className="container">
          <ul className="m-0 mb-10 flex list-none flex-wrap gap-2 p-0">
            <li>
              <Link
                aria-current={!current ? 'page' : undefined}
                className={chip(!current)}
                href={urls.blogIndex()}
              >
                Todos
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  aria-current={current?.id === category.id ? 'page' : undefined}
                  className={chip(current?.id === category.id)}
                  href={urls.blogCategory(category.slug)}
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-0 p-0 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3">
            {posts.map((post) => {
              const category = typeof post.category === 'object' ? post.category : null
              const image = typeof post.meta?.image === 'object' ? post.meta.image : null
              const href = category && post.slug ? urls.post(category.slug, post.slug) : '#'
              return (
                <li key={post.id}>
                  <article className="group flex h-full flex-col">
                    <Link
                      aria-hidden
                      className="block h-[200px] w-full overflow-hidden rounded-2xl"
                      href={href}
                      tabIndex={-1}
                    >
                      <Picture
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                        image={image}
                      />
                    </Link>
                    {category && (
                      <p className="m-0 mt-4 text-[0.875em] font-medium leading-normal text-[#276ef1]">
                        {category.title}
                      </p>
                    )}
                    <h2 className="m-0 mb-2 text-base font-medium leading-tight text-black min-[768px]:font-[family-name:var(--font-heading)] min-[768px]:text-[calc(1.275rem+0.3vw)] min-[768px]:font-semibold min-[1200px]:text-2xl">
                      <Link className="hover:underline" href={href}>
                        {post.title}
                      </Link>
                    </h2>
                    {post.meta?.description && (
                      <p className="mb-4 mt-0 line-clamp-2 text-base font-light leading-normal text-[#4b4b4b]">
                        {post.meta.description}
                      </p>
                    )}
                    <Link
                      className="link-underline mb-8 mt-auto self-start text-base font-medium leading-normal text-black"
                      href={href}
                      tabIndex={-1}
                    >
                      Ler artigo <ArrowRight aria-hidden className="ml-2 inline size-4" />
                    </Link>
                  </article>
                </li>
              )
            })}
          </ul>
          <Pagination hrefFor={hrefFor} page={page} totalPages={totalPages} variant="uber" />
        </div>
      </section>
    </>
  )
}
