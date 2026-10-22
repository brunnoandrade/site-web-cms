import Link from 'next/link'
import React from 'react'

import type { Post } from '@digio/payload-types'

import { Picture } from '@/components/Picture'
import RichText from '@/components/RichText'
import { find } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { pathsOf } from '@/lib/urlStyle'
import { cn } from '@/utilities/ui'

import { ArticleToc } from './ArticleToc.client'

type Node = { type?: string; tag?: string; text?: string; children?: Node[] }

const textOf = (node: Node): string =>
  `${node.text ?? ''}${(node.children ?? []).map(textOf).join('')}`

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Headings (h2) of the article: the "Neste artigo você vai ver" list. */
const headingsOf = (post: Post) =>
  ((post.content as { root?: Node })?.root?.children ?? [])
    .filter((node) => node.type === 'heading' && node.tag === 'h2')
    .map((node) => textOf(node).trim())
    .filter(Boolean)

const minutes = (post: Post) =>
  Math.max(1, Math.ceil(textOf((post.content as { root: Node }).root).split(/\s+/).length / 200))

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : ''

/** Uber Conta article: black header, summary on the left, text in the middle, latest posts on the right. */
export async function UberPost({ post, tenant }: { post: Post; tenant: string }) {
  const urls = pathsOf(await requireTenant(tenant))
  const headings = headingsOf(post)
  const { docs: latest } = await find('posts', {
    tenant,
    depth: 1,
    limit: 4,
    sort: '-publishedAt',
    select: { title: true, slug: true, category: true, meta: true },
    tags: ['posts'],
  })
  const others = latest.filter((item) => item.id !== post.id).slice(0, 3)

  return (
    <article>
      <header className="relative -mt-24 flex overflow-hidden bg-black text-white">
        {typeof post.heroImage === 'object' && post.heroImage && (
          <Picture
            alt=""
            className="absolute inset-0 size-full object-cover object-center opacity-50"
            image={post.heroImage}
            loading="eager"
          />
        )}
        {/* Current site: .hero.half in .post (45vh, 55vh from 992px; title display-2, left aligned). */}
        <div className="container relative flex h-[45vh] min-h-[22rem] flex-col items-start justify-end min-[992px]:h-[55vh]">
          <div className="mb-20 w-full min-[992px]:mb-[10vh]">
            <h1 className="m-0 text-[calc(1.575rem+3.9vw)] font-semibold leading-none min-[1200px]:text-[4.5rem]">
              {post.title}
            </h1>
            <p className="mb-0 mt-4 text-base font-light text-[#ddd]">
              {minutes(post)} minutos de leitura · {formatDate(post.publishedAt)}
            </p>
          </div>
        </div>
      </header>

      {/* .blog-article: row with col-lg-2 (summary), col-lg-7 (text) and col-lg-3 (latest posts). */}
      <div className="container pb-4 pt-8 min-[992px]:pb-12">
        <div className="-mx-3 grid grid-cols-1 min-[992px]:grid-cols-12">
          <div className="hidden px-3 min-[992px]:col-span-2 min-[992px]:block">
            {headings.length > 0 && (
              <nav aria-label="Índice do artigo" className="sticky top-[120px]">
                <h4 className="mb-6 mt-0 text-base font-semibold leading-none text-black">
                  Neste artigo você vai ver:
                </h4>
                <ArticleToc items={headings.map((title) => ({ id: slugify(title), title }))} />
              </nav>
            )}
          </div>
          <div className="min-w-0 px-3 min-[992px]:col-span-7">
            <RichText
              className={cn(
                'text-base font-light leading-normal text-[#4b4b4b]',
                '[&_p]:mb-[1.2rem] [&_p]:mt-0',
                '[&_h1]:mb-4 [&_h1]:mt-5 [&_h2]:mb-4 [&_h2]:mt-5 [&_h3]:mb-4 [&_h3]:mt-5 [&_h4]:mb-4 [&_h4]:mt-5',
                '[&_h1]:font-medium [&_h2]:font-medium [&_h3]:font-medium [&_h4]:font-medium',
                '[&_h1]:leading-[1.3] [&_h2]:leading-[1.3] [&_h3]:leading-[1.3] [&_h4]:leading-[1.3]',
                '[&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black',
                '[&_h1]:text-[calc(1.375rem+1.5vw)] min-[1200px]:[&_h1]:text-[2.5rem]',
                '[&_h2]:text-[calc(1.325rem+0.9vw)] min-[1200px]:[&_h2]:text-[2rem] [&_h2]:scroll-mt-28',
                '[&_h3]:text-[calc(1.275rem+0.3vw)] min-[1200px]:[&_h3]:text-2xl',
                '[&_h4]:text-xl',
                '[&_a]:text-[#276ef1] [&_a]:underline hover:[&_a]:text-black',
                '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:m-0 [&_li]:p-0',
                '[&_img]:max-w-full [&_img]:rounded-[0.5rem] [&_figure]:my-6 [&_figure_img]:w-full',
                '[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-[0.85em] [&_figcaption]:italic [&_figcaption]:text-[#a6a6a6]',
                '[&_blockquote]:my-6 [&_blockquote]:rounded-r-[0.25rem] [&_blockquote]:border-0 [&_blockquote]:border-l-4 [&_blockquote]:border-solid [&_blockquote]:border-[#276ef1] [&_blockquote]:bg-[#f3f3f3] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic [&_blockquote_p]:m-0',
                '[&_hr]:my-6 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[#ddd]',
              )}
              data={post.content}
              enableGutter={false}
              enableProse={false}
              headingIds
            />
          </div>
          {others.length > 0 && (
            <aside
              aria-labelledby="ultimas"
              className="hidden px-3 min-[992px]:col-span-3 min-[992px]:block"
            >
              <div className="sticky top-[120px]">
                <h4
                  className="mb-6 mt-0 text-base font-semibold leading-none text-black"
                  id="ultimas"
                >
                  Últimas postagens
                </h4>
                {others.map((item) => {
                  const category = typeof item.category === 'object' ? item.category : null
                  const image = typeof item.meta?.image === 'object' ? item.meta.image : null
                  const href = category && item.slug ? urls.post(category.slug, item.slug) : '#'
                  return (
                    <article key={item.id} className="mb-6">
                      <Link className="block text-black no-underline" href={href}>
                        <div className="relative mb-2 block h-[200px] w-full overflow-hidden">
                          <Picture
                            alt=""
                            className="block size-full rounded-[0.375rem] object-cover"
                            image={image}
                          />
                        </div>
                        <span className="font-semibold leading-none">{item.title}</span>
                      </Link>
                    </article>
                  )
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
    </article>
  )
}
