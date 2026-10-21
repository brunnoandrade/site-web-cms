import React from 'react'

import type { StepsBlock as StepsBlockProps } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { CMSLink } from '@/components/Link'
import { Section, SectionHeading } from '@/components/Section'

import { StepsList } from './StepsList'

/**
 * Uber Conta "contratar" section: black, title and button on the left, the app screen inside a
 * phone in the middle and the numbered steps on the right (one open at a time; the phone shows
 * the screen of the open step). Under 992px the steps are stacked, each with its own screen.
 */
export const StepsBlock: React.FC<StepsBlockProps> = ({
  theme,
  heading,
  intro,
  enableLink,
  link,
  items,
}) => {
  if (!items?.length) return null

  const button = enableLink && link && (
    <CMSLink {...link} appearance="inverse" size="lg">
      <ArrowRightIcon className="size-[15px]" />
    </CMSLink>
  )

  return (
    <Section
      className="!bg-white bg-[radial-gradient(circle_at_center_bottom,#000c,#000_60%)] min-[992px]:pb-0"
      theme={theme ?? 'navy'}
    >
      <div className="container grid items-start gap-x-6 min-[992px]:grid-cols-12 min-[1200px]:grid-cols-12">
        <div className="mb-12 min-[992px]:col-span-12 min-[1200px]:col-span-4 min-[1200px]:mb-0">
          <SectionHeading className="text-white">{heading}</SectionHeading>
          {intro && <p className="mb-0 mt-4 font-light text-white">{intro}</p>}
          {button && <div className="mt-8 max-[991px]:hidden">{button}</div>}
        </div>
        <StepsList items={items} />
      </div>
      {enableLink && link && (
        <div className="container min-[992px]:hidden">
          <CMSLink
            {...link}
            appearance="inverse"
            className="!bg-[#e8e8e8] !text-black hover:!bg-[#d6d6d6]"
            size="lg"
          >
            <ArrowRightIcon className="size-[15px]" />
          </CMSLink>
        </div>
      )}
    </Section>
  )
}
