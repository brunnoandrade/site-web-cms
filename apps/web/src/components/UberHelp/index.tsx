import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Faq, HelpCategory, HelpTopic } from '@digio/payload-types'

import { Picture } from '@/components/Picture'
import RichText from '@/components/RichText'
import { Strip } from '@/components/Strip'
import { categoryPath, questionPath } from '@/lib/uber-help'

export type Crumb = { label: string; href?: string }

/** Round back button and the trail "Ajuda > Categoria > Pergunta". */
export const HelpBackBar: React.FC<{ items: Crumb[]; back: string }> = ({ items, back }) => (
  <nav aria-label="Trilha de navegação" className="container flex items-center gap-4 pb-8 pt-8">
    <Link
      aria-label="Voltar"
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e8e8e8] transition-colors hover:bg-[#d6d6d6]"
      href={back}
    >
      <ArrowLeft aria-hidden className="size-5" />
    </Link>
    <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight aria-hidden className="size-3" />}
          {item.href ? (
            <Link className="text-black hover:underline" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
)

/** Help home: one white card per category (icon, name, description). */
export const CategoryCards: React.FC<{ categories: HelpCategory[] }> = ({ categories }) => (
  <section className="bg-[#f3f3f3] pb-16 pt-12 min-[992px]:pb-24">
    <ul className="container m-0 grid list-none grid-cols-1 gap-4 p-0 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            className="flex h-full min-h-[220px] flex-col rounded-2xl bg-white p-6 transition-shadow hover:shadow-[0_8px_35px_#00000026] motion-reduce:transition-none"
            href={categoryPath(category.slug!)}
          >
            {category.icon && typeof category.icon === 'object' && (
              <Picture alt="" className="mb-4 size-10" image={category.icon} />
            )}
            <h2 className="mb-2 mt-auto text-xl font-semibold text-black">{category.title}</h2>
            {category.description && (
              <p className="m-0 text-sm font-light text-[#4b4b4b]">{category.description}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  </section>
)

/** A list of question links inside a white card. */
export const QuestionList: React.FC<{ title?: string; faqs: Faq[] }> = ({ title, faqs }) => (
  <div className="mb-4 overflow-hidden rounded-xl bg-white">
    {title && <h2 className="m-0 px-6 py-4 text-base font-medium text-black">{title}</h2>}
    <ul className="m-0 list-none p-0">
      {faqs.map((faq) => (
        <li key={faq.id} className="border-t border-[#f3f3f3]">
          <Link
            className="flex items-center justify-between gap-4 px-6 py-4 text-sm text-black transition-colors hover:bg-[#f3f3f3]"
            href={questionPath(faq.slug!)}
          >
            {faq.question}
            <ChevronRight aria-hidden className="size-4 shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

/** Category page body: icon, name, description and the groups with their questions. */
export const CategoryGroups: React.FC<{ category: HelpCategory; groups: HelpTopic[] }> = ({
  category,
  groups,
}) => (
  <section className="bg-[#f3f3f3] pb-24">
    <div className="container max-w-[960px]">
      {category.icon && typeof category.icon === 'object' && (
        <Picture alt="" className="mb-6 size-10" image={category.icon} />
      )}
      <h1 className="mb-4 mt-0 text-3xl font-semibold text-black min-[992px]:text-title">{category.title}</h1>
      {category.description && <p className="mb-8 mt-0 font-light text-[#4b4b4b]">{category.description}</p>}
      {groups.map((group) => {
        const faqs = (group.faqs ?? []).filter((faq): faq is Faq => typeof faq === 'object' && Boolean(faq.slug))
        // A category with a single group shows the questions without a repeated title.
        return (
          <QuestionList
            key={group.id}
            faqs={faqs}
            title={groups.length > 1 || group.title !== category.title ? group.title : undefined}
          />
        )
      })}
    </div>
  </section>
)

/** Question page: the answer in an article and "Assuntos relacionados" as a row of cards. */
export const QuestionArticle: React.FC<{ faq: Faq; related: Faq[] }> = ({ faq, related }) => (
  <>
    <article className="container max-w-[860px] pb-12">
      <h1 className="mb-8 mt-4 text-3xl font-semibold text-black min-[992px]:text-[2rem]">{faq.question}</h1>
      <RichText
        className="font-light text-[#4b4b4b] [&_li]:m-0 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:mt-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
        data={faq.answer}
        enableGutter={false}
      />
    </article>
    {related.length > 0 && (
      <section aria-labelledby="relacionados" className="container pb-16">
        <h2 className="mb-6 mt-4 text-sm font-medium text-black" id="relacionados">
          Assuntos relacionados
        </h2>
        <Strip itemClassName="min-[992px]:w-[calc((100%-2rem)/3)]" mobileScroll>
          {related.map((item) => (
            <Link
              key={item.id}
              className="flex h-full min-h-[140px] items-center justify-between gap-4 rounded-2xl bg-[#f3f3f3] p-6 text-xl font-semibold text-black transition-colors hover:bg-black hover:text-white motion-reduce:transition-none"
              href={questionPath(item.slug!)}
            >
              {item.question}
              <ArrowRight aria-hidden className="size-6 shrink-0" />
            </Link>
          ))}
        </Strip>
      </section>
    )}
  </>
)
