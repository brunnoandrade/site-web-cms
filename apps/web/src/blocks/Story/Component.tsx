import React from 'react'

import type { StoryBlock as Props } from '@digio/payload-types'

import { Lines } from '@/components/Lines'
import { Picture } from '@/components/Picture'
import { Section, SectionHeading } from '@/components/Section'

/** Black section: the photo (rounded) on the left; title, text and two highlights on the right. */
export const StoryBlock: React.FC<Props> = ({ image, imageMobile, heading, text, items }) => (
  <Section className="py-8" spacing="none" theme="navy">
    <div className="container grid gap-8 min-[992px]:grid-cols-2 min-[992px]:gap-6">
      <Picture
        alt={typeof image === 'object' ? (image?.alt ?? '') : ''}
        className="mx-auto block h-auto max-w-full rounded-2xl min-[992px]:rounded-[2rem]"
        image={image}
        mobile={imageMobile}
      />
      <div className="flex flex-col min-[992px]:py-[15%] min-[992px]:pl-8">
        <SectionHeading className="text-white">
          <Lines text={heading} />
        </SectionHeading>
        {text && <p className="mb-0 mt-3 font-light text-[#ddd]">{text}</p>}
        {items && items.length > 0 && (
          <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-6 p-0 min-[992px]:mt-auto">
            {items.map((item, i) => (
              <li key={item.id ?? i}>
                {item.icon && <Picture alt="" className="mb-4 size-8 w-auto" image={item.icon} />}
                <h3 className="m-0 text-xl font-semibold text-white">{item.title}</h3>
                {item.text && <p className="mb-0 mt-1 text-sm font-light text-[#ddd]">{item.text}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </Section>
)
