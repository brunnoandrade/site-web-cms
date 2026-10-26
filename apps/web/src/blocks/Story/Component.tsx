import React from 'react'

import type { StoryBlock as Props } from '@digio/payload-types'

import { Lines } from '@/components/Lines'
import { Picture } from '@/components/Picture'
import { Section, SectionHeading } from '@/components/Section'

const headingClass =
  'm-0 text-[calc(1.425rem+2.1vw)] leading-none tracking-normal text-white min-[1200px]:text-[3rem]'

/**
 * Black section like the current site's `.story`: under 992px the title comes first, then the
 * photo (200px tall at most), text and highlights; from 992px the photo sits on the left and
 * title, text and highlights on the right (highlights at the bottom of the column).
 */
export const StoryBlock: React.FC<Props> = ({ image, imageMobile, heading, text, items }) => (
  <Section className="py-8" spacing="none" theme="navy">
    <div className="container grid min-[768px]:max-[991px]:[&>*]:max-w-[calc(50%-12px)] min-[992px]:grid-cols-2 min-[992px]:gap-6">
      <SectionHeading className={`${headingClass} min-[992px]:hidden`}>
        <Lines text={heading} />
      </SectionHeading>
      <Picture
        alt={typeof image === 'object' ? (image?.alt ?? '') : ''}
        className="mt-4 block h-auto max-h-[200px] w-auto max-w-full rounded-[2rem] min-[992px]:mt-0 min-[992px]:max-h-none"
        image={image}
        mobile={imageMobile}
      />
      <div className="flex flex-col min-[992px]:py-[15%]">
        <SectionHeading className={`${headingClass} max-[991px]:hidden`}>
          <Lines text={heading} />
        </SectionHeading>
        {text && <p className="my-4 font-light text-[#ddd]">{text}</p>}
        {items && items.length > 0 && (
          <ul className="-ml-2 m-0 mt-0 grid list-none grid-cols-2 p-0 min-[992px]:mt-auto">
            {items.map((item, i) => (
              <li key={item.id ?? i} className="px-3 pb-8">
                {item.icon && (
                  <Picture
                    alt=""
                    className={`mb-4 block h-auto rounded-[2rem] ${i === 0 ? 'w-10' : 'w-8'}`}
                    image={item.icon}
                  />
                )}
                <h3 className="mb-2 mt-0 text-base font-semibold leading-none text-white min-[768px]:text-[calc(1.275rem+0.3vw)]">
                  {item.title}
                </h3>
                {item.text && <p className="m-0 mt-2 font-light text-[#ddd]">{item.text}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </Section>
)
