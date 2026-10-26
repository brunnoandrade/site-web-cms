import { ChevronRight } from 'lucide-react'
import React from 'react'

import type { ContactsBlock as Props } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Lines, Paragraphs } from '@/components/Lines'
import { CMSLink } from '@/components/Link'
import { Picture } from '@/components/Picture'
import { Section, SectionHeading } from '@/components/Section'

type Entry = NonNullable<NonNullable<Props['groups']>[number]['entries']>[number]

const EntryRow: React.FC<{ entry: Entry }> = ({ entry }) => {
  const body = (
    <>
      <div className="flex gap-4">
        {entry.icon && <Picture alt="" className="size-6 shrink-0" image={entry.icon} />}
        <div>
          <p className="m-0 mt-1 text-sm leading-none text-black">{entry.title}</p>
          {entry.description && (
            <p className="mb-0 mt-1 text-sm font-light leading-[1.5] text-[#4b4b4b]">
              <Lines text={entry.description.replace(/\n\s*\n/g, '\n')} />
            </p>
          )}
        </div>
      </div>
      {entry.phone && (
        <p className="m-0 whitespace-nowrap text-sm leading-[1.5] text-black">{entry.phone}</p>
      )}
      {entry.enableLink && entry.link && <ChevronRight aria-hidden className="size-4 shrink-0" />}
    </>
  )
  const className =
    'flex items-start justify-between gap-4 border-b border-[#e8e8e8] pb-[14px] mb-[14px] last:mb-0 last:border-0 last:pb-0'
  return entry.enableLink && entry.link ? (
    <CMSLink {...entry.link} appearance="inline" className={className} label={null}>
      {body}
    </CMSLink>
  ) : (
    <div className={className}>{body}</div>
  )
}

/** Heading and text on the left, the contact groups as grey cards on the right. */
export const ContactsBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  text,
  enableLink,
  link,
  groups,
}) => (
  <Section theme="light">
    <div className="container grid gap-8 min-[992px]:grid-cols-2 min-[992px]:gap-6 min-[1200px]:grid-cols-[40.6%_49.1%] min-[1200px]:gap-x-[10.3%]">
      <div>
        {eyebrow && <p className="mb-2 mt-0 text-sm leading-none text-[#4b4b4b]">{eyebrow}</p>}
        <SectionHeading>{heading}</SectionHeading>
        {text && <Paragraphs className="mb-4 mt-4 font-light text-[#4b4b4b]" text={text} />}
        {enableLink && link && (
          <CMSLink
            {...link}
            appearance="inverse"
            className="mt-4 w-fit !bg-[#e8e8e8] !text-black hover:!bg-[#d6d6d6]"
            size="lg"
          >
            <ArrowRightIcon className="size-[15px]" />
          </CMSLink>
        )}
      </div>
      <div>
        {(groups ?? []).map((group, i) => (
          <div key={group.id ?? i} className="mb-3 rounded-2xl bg-[#f3f3f3] p-6">
            {group.title && (
              <p className="mb-3 mt-0 text-sm leading-none text-[#a6a6a6]">{group.title}</p>
            )}
            {(group.entries ?? []).map((entry, j) => (
              <EntryRow key={entry.id ?? j} entry={entry} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </Section>
)
