import { ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Faq, HelpCategory, HelpTopic } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Picture } from '@/components/Picture'
import RichText from '@/components/RichText'
import { Strip } from '@/components/Strip'
import { categoryPath, questionPath } from '@/lib/uber-help'

export type Crumb = { label: string; href?: string }

/** Round back button and the trail "Ajuda > Categoria > Pergunta". */
export const HelpBackBar: React.FC<{ items: Crumb[]; back: string }> = ({ items, back }) => (
  <nav
    aria-label="Trilha de navegação"
    className="container flex items-center gap-8 pb-0 pt-8 min-[992px]:pt-12"
  >
    <Link
      aria-label="Voltar"
      className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-[#e8e8e8] transition-colors hover:bg-[#d6d6d6]"
      href={back}
    >
      <ArrowLeft aria-hidden className="size-5" />
    </Link>
    <ol className="m-0 flex list-none flex-wrap items-center gap-[18.5px] p-0 text-sm leading-none">
      {items.map((item, i) => (
        <li
          key={i}
          className={`flex items-center gap-[18.5px] ${i === items.length - 1 && i > 0 ? 'max-[991px]:hidden' : ''}`}
        >
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
  <section className="bg-[#f3f3f3] pb-8 pt-6 min-[992px]:pb-[108px] min-[992px]:pt-[52px]">
    <ul className="m-0 mx-auto grid max-w-[1120px] list-none grid-cols-1 p-0 min-[992px]:grid-cols-2 min-[1200px]:grid-cols-3">
      {categories.map((category) => (
        <li key={category.id} className="px-3 py-2 min-[992px]:py-3">
          <Link
            className="group flex h-full flex-col rounded-2xl bg-white p-6 transition-colors duration-200 ease-in-out hover:bg-black focus-visible:bg-black motion-reduce:transition-none min-[992px]:min-h-[250px] min-[992px]:justify-between"
            href={categoryPath(category.slug!)}
          >
            {category.icon && typeof category.icon === 'object' && (
              <Picture
                alt=""
                className="mb-8 size-7 min-[768px]:size-10 min-[992px]:mb-0"
                image={category.icon}
              />
            )}
            <div>
              <h2 className="mb-2 mt-0 transition-colors duration-200 ease-in-out group-hover:text-white group-focus-visible:text-white motion-reduce:transition-none !font-sans text-base font-medium leading-none text-black min-[768px]:!font-[family-name:var(--font-heading)] min-[768px]:text-[calc(1.275rem+0.3vw)] min-[768px]:font-semibold min-[1200px]:text-2xl">
                {category.title}
              </h2>
              {category.description && (
                <p className="m-0 mt-4 font-light text-[#4b4b4b] transition-colors duration-200 ease-in-out group-hover:text-white group-focus-visible:text-white motion-reduce:transition-none">
                  {category.description}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </section>
)

/** A list of question links inside a white card. */
export const QuestionList: React.FC<{ title?: string; faqs: Faq[] }> = ({ title, faqs }) => (
  <div className="mb-4 overflow-hidden rounded-md bg-white">
    {title && <h2 className="m-0 px-6 py-4 text-base font-medium text-black">{title}</h2>}
    <ul className="m-0 list-none p-0">
      {faqs.map((faq) => (
        <li key={faq.id} className="border-b border-[#f3f3f3]">
          <Link
            className="flex min-h-14 items-center justify-between gap-4 p-4 text-sm leading-[1.5] text-black transition-colors duration-200 hover:bg-[#f3f3f3]"
            href={questionPath(faq.slug!)}
          >
            {faq.question}
            <ChevronRight aria-hidden className="size-6 shrink-0" />
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
  <section className="bg-[#f3f3f3] pb-24 pt-4">
    <div className="mx-auto max-w-[1120px] px-3">
      {category.icon && typeof category.icon === 'object' && (
        <Picture
          alt=""
          className="mb-6 mt-2 size-7 min-[768px]:size-10 min-[992px]:mt-12"
          image={category.icon}
        />
      )}
      <h1 className="m-0 mb-4 py-1 !font-[family-name:var(--font-heading)] text-[1.35rem] font-semibold leading-none text-black min-[768px]:text-[calc(1.325rem+0.9vw)] min-[1200px]:text-[2rem]">
        {category.title}
      </h1>
      {category.description && (
        <p className="mb-8 mt-0 font-light text-[#4b4b4b]">{category.description}</p>
      )}
      {groups.map((group) => {
        const faqs = (group.faqs ?? []).filter(
          (faq): faq is Faq => typeof faq === 'object' && Boolean(faq.slug),
        )
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
    <article className="container pb-4 min-[768px]:pb-12">
      <div className="mx-auto max-w-[1116px]">
        <h1 className="mb-8 mt-10 text-[calc(1.375rem+1.5vw)] font-semibold leading-none text-black min-[992px]:mt-12 min-[1200px]:text-[2.5rem]">
          {faq.question}
        </h1>
        <RichText
          className="font-light text-[#4b4b4b] [&_li]:m-0 [&_li]:leading-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:mt-0 [&_p]:leading-6 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
          data={faq.answer}
          enableGutter={false}
        />
      </div>
    </article>
    {related.length > 0 && (
      <section aria-labelledby="relacionados" className="container pb-16">
        <h2 className="mb-8 mt-0 text-base font-medium leading-none text-black" id="relacionados">
          Assuntos relacionados
        </h2>
        <Strip
          className="-mx-[15px]"
          listClassName="max-[767px]:scroll-pl-[15px] max-[767px]:pl-[15px]"
          controlsClassName="!mt-7 max-[767px]:!mt-7"
          dotsOnly
          gapClassName="gap-[15px] min-[768px]:gap-5"
          itemClassName="min-[768px]:w-[calc((100%-20px)/2)] min-[992px]:w-[calc((100%-20px)/2)] min-[1200px]:w-[calc((100%-40px)/3)]"
          mobileItemClassName="w-[316px]"
          mobileScroll
          primaryControls
        >
          {related.map((item) => (
            <Link
              key={item.id}
              className="group flex min-h-[140px] items-center rounded-2xl bg-[#f3f3f3] px-6 py-10 text-black transition-colors duration-200 ease-in-out hover:bg-black hover:text-white motion-reduce:transition-none"
              href={questionPath(item.slug!)}
            >
              <span className="flex w-full items-start justify-between gap-5 text-xl font-medium leading-none min-[768px]:font-semibold">
                <span>{item.question}</span>
                <ArrowRightIcon className="mt-px w-[22px] shrink-0" />
              </span>
            </Link>
          ))}
        </Strip>
      </section>
    )}
  </>
)
