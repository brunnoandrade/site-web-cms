import React from 'react'

import type { ImageContentBlock as Props } from '@digio/payload-types'

import { ArrowRightIcon } from '@/components/ArrowRightIcon'
import { Lines } from '@/components/Lines'
import { CMSLink } from '@/components/Link'
import { Picture } from '@/components/Picture'
import { Section, SectionHeading } from '@/components/Section'

const Content: React.FC<Props> = ({ logo, eyebrow, heading, text, items, enableLink, link, legend }) => (
  <>
    {logo && typeof logo === 'object' && (
      <Picture alt={logo.alt ?? ''} className="mb-6 h-8 w-auto max-[991px]:hidden" image={logo} />
    )}
    {eyebrow && <p className="mb-2 mt-0 text-white">{eyebrow}</p>}
    <SectionHeading className="text-white">
      <Lines text={heading} />
    </SectionHeading>
    {text && <p className="mb-0 mt-4 font-light text-[#ddd]">{text}</p>}
    {items && items.length > 0 && (
      <ul className="m-0 mt-8 list-none p-0">
        {items.map((item, i) => (
          <li key={item.id ?? i} className="flex items-center gap-4 border-b border-white/20 py-4">
            {item.icon && <Picture alt="" className="size-10 shrink-0" image={item.icon} />}
            <p className="m-0 text-sm text-[#ddd]">{item.text}</p>
          </li>
        ))}
      </ul>
    )}
    {enableLink && link && (
      <CMSLink {...link} appearance="inverse" className="my-8 w-fit" size="lg">
        <ArrowRightIcon className="size-[15px]" />
      </CMSLink>
    )}
    {legend && <p className="m-0 text-sm text-white max-md:text-center">{legend}</p>}
  </>
)

/**
 * Image with text. "card": rounded dark card, the image on the left (cut to the card) and the
 * text on the right; stacked on mobile. "section": black full-width section with the image
 * covering the left half from 992px (above the text, rounded, below it).
 */
export const ImageContentBlock: React.FC<Props> = (props) => {
  const { variant, theme, image, imageMobile } = props

  if (variant === 'section') {
    return (
      <Section className="relative overflow-hidden" theme={theme ?? 'navy'}>
        <div className="container grid items-center gap-8 min-[992px]:grid-cols-2 min-[992px]:gap-0">
          <div className="min-[992px]:order-1">
            <Picture
              alt=""
              className="block h-auto w-full rounded-2xl min-[992px]:hidden"
              image={imageMobile ?? image}
            />
          </div>
          <div className="min-[992px]:order-2 min-[992px]:col-start-2">
            <Content {...props} />
          </div>
        </div>
        {/* Desktop: the image fills the left half as the section background. */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/2 max-[991px]:hidden">
          <Picture alt="" className="size-full object-cover object-left" image={image} />
        </div>
      </Section>
    )
  }

  return (
    <Section spacing="none" className="py-8 min-[992px]:py-16" theme="light">
      <div className="container">
        <div className="relative grid overflow-hidden rounded-2xl bg-black text-white min-[992px]:min-h-[29rem] min-[992px]:grid-cols-2 min-[992px]:rounded-[2rem]">
          {/* The image is the whole card on desktop (the photo sits on the left, the text on the
              right); on mobile it comes first and the text below it. */}
          <Picture
            alt=""
            className="block h-auto w-full min-[992px]:absolute min-[992px]:inset-0 min-[992px]:h-full min-[992px]:object-cover min-[992px]:object-left"
            image={image}
            mobile={imageMobile}
          />
          <div className="relative p-6 min-[992px]:col-start-2 min-[992px]:flex min-[992px]:flex-col min-[992px]:justify-center min-[992px]:py-12 min-[992px]:pr-12">
            <Content {...props} />
          </div>
        </div>
      </div>
    </Section>
  )
}
