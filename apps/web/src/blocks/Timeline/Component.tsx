import React from 'react'

import type { TimelineBlock as Props } from '@digio/payload-types'

import { Lines, Paragraphs } from '@/components/Lines'
import { Picture } from '@/components/Picture'
import { Section, SectionHeading } from '@/components/Section'
import { Strip } from '@/components/Strip'

/** Heading and text side by side, then the milestones as grey cards on a dotted time line. */
export const TimelineBlock: React.FC<Props> = ({ heading, text, items }) => (
  <Section theme="light">
    <div className="container">
      <div className="grid gap-6 min-[992px]:grid-cols-2 min-[992px]:gap-24">
        <SectionHeading>
          <Lines text={heading} />
        </SectionHeading>
        {text && (
          <div>
            <Paragraphs className="mb-4 mt-0 font-light text-[#4b4b4b]" text={text} />
          </div>
        )}
      </div>
      <Strip className="mt-12" itemClassName="min-[992px]:w-[calc((100%-3rem)/4)]" mobileScroll>
        {(items ?? []).map((item, i) => (
          <div key={item.id ?? i} className="group h-full rounded-2xl bg-[#f3f3f3] p-6">
            {item.icon && (
              <Picture
                alt=""
                className="size-24 transition-transform duration-200 group-hover:scale-[1.16] motion-reduce:transition-none"
                image={item.icon}
              />
            )}
            <div className="-mx-6 mb-12 mt-12 border-t border-[#e8e8e8] px-6">
              <h6 className="m-0 text-base text-[#276ef1] before:-mt-[5px] before:mb-2.5 before:block before:size-2 before:rounded-full before:bg-[#276ef1] before:content-['']">
                {item.period}
              </h6>
            </div>
            <h3 className="m-0 text-xl font-semibold">{item.title}</h3>
            {item.text && <p className="mb-0 mt-2 min-h-[95px] text-sm font-light text-[#4b4b4b]">{item.text}</p>}
          </div>
        ))}
      </Strip>
    </div>
  </Section>
)
