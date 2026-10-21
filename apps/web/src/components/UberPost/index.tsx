import Link from 'next/link'
import React from 'react'

import type { Post } from '@digio/payload-types'
import { postPath } from '@digio/routes'

import { Picture } from '@/components/Picture'
import RichText from '@/components/RichText'
import { find } from '@/lib/cms'

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
  Math.max(1, Math.round(textOf((post.content as { root: Node }).root).split(/\s+/).length / 200))

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
      <header className="relative -mt-24 overflow-hidden bg-black pb-16 pt-56 text-white min-[992px]:pt-64">
        {typeof post.heroImage === 'object' && post.heroImage && (
          <Picture
            alt=""
            className="absolute inset-0 size-full object-cover object-center opacity-50"
            image={post.heroImage}
            loading="eager"
          />
        )}
        <div className="container relative">
          <h1 className="m-0 max-w-[1000px] text-[calc(1.375rem+1.5vw)] font-semibold leading-none min-[1200px]:text-[4rem]">
            {post.title}
          </h1>
          <p className="mb-0 mt-4 text-sm font-light text-[#ddd]">
            {minutes(post)} minutos de leitura · {formatDate(post.publishedAt)}
          </p>
        </div>
      </header>

      <div className="container grid gap-10 py-12 min-[992px]:grid-cols-[200px_minmax(0,1fr)_260px] min-[992px]:gap-12">
        {headings.length > 0 && (
          <nav
            aria-label="Neste artigo"
            className="min-[992px]:sticky min-[992px]:top-28 min-[992px]:self-start"
          >
            <h2 className="mb-3 mt-0 text-sm font-medium text-black">Neste artigo você vai ver:</h2>
            <ul className="m-0 list-none p-0 text-sm">
              {headings.map((heading) => (
                <li key={heading} className="mb-3">
                  <a className="text-[#4b4b4b] hover:text-[#276ef1]" href={`#${slugify(heading)}`}>
                    {heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="min-w-0 min-[992px]:col-start-2">
          <RichText
            className="max-w-none font-light text-[#4b4b4b] [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:scroll-mt-28 [&_h2]:text-2xl min-[992px]:[&_h2]:text-[2rem] [&_h2]:font-semibold [&_h2]:text-black [&_h3]:text-xl [&_h3]:text-black [&_li]:m-0 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:mt-0 [&_strong]:text-black [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
            data={post.content}
            enableGutter={false}
            headingIds
          />
        </div>
        {others.length > 0 && (
          <aside
            aria-labelledby="ultimas"
            className="min-[992px]:col-start-3 min-[992px]:row-start-1"
          >
            <h2 className="mb-4 mt-0 text-sm font-medium text-black" id="ultimas">
              Últimas postagens
            </h2>
            <ul className="m-0 list-none p-0">
              {others.map((item) => {
                const category = typeof item.category === 'object' ? item.category : null
                const image = typeof item.meta?.image === 'object' ? item.meta.image : null
                const href = category && item.slug ? postPath(category.slug, item.slug) : '#'
                return (
                  <li key={item.id} className="mb-6">
                    <Link className="block text-black" href={href}>
                      <Picture
                        alt=""
                        className="mb-2 aspect-[16/10] w-full rounded-lg object-cover"
                        image={image}
                      />
                      <span className="text-sm font-semibold leading-snug">{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </aside>
        )}
      </div>
    </article>
  )
}
