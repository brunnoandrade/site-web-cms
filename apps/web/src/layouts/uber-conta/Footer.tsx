import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'
import { cn } from '@/utilities/ui'

import { Picture } from '@/components/Picture'

/** Link with the underline that grows from the left on hover (`.link` of the current site). */
const underline =
  "relative inline-block after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-200 after:content-[''] hover:after:w-full motion-reduce:after:transition-none"

/**
 * Uber Conta footer, measured on the current site (light, 992px / 768px breakpoints).
 *
 * Desktop: logo and highlight image in a quarter column; link columns (3 per row) in the rest,
 * 3rem from the logo. Mobile: everything stacked, columns two per row, links smaller and tighter.
 * Bottom bar: legal text and links, centered on mobile.
 */
export async function Footer({ tenant }: { tenant: string }) {
  const [footerData, { name }] = await Promise.all([
    findOne('footer', { tenant, depth: 1 }),
    requireTenant(tenant),
  ])

  const columns = footerData?.columns ?? []
  const bottomLinks = footerData?.navItems ?? []

  return (
    <footer className="mt-auto border-t border-lilac-100 bg-lilac-50 pt-12 text-[#4b4b4b]">
      <div className="container">
        <div className="min-[992px]:grid min-[992px]:grid-cols-4 min-[992px]:gap-x-6">
          <div>
            <Link
              aria-label={`${name}, página inicial`}
              className="mb-8 inline-block min-[992px]:mb-16"
              href="/"
            >
              <Picture
                alt={name}
                className="h-[23px] w-auto max-w-full min-[992px]:h-20"
                image={footerData?.logo}
                mobile={footerData?.logoMobile}
              />
            </Link>
            <Picture alt="" className="block h-auto max-w-[14rem]" image={footerData?.highlightImage} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 min-[992px]:col-span-3 min-[992px]:mt-0 min-[992px]:grid-cols-3 min-[992px]:pl-12">
            {columns.map((column, i) => (
              <nav aria-label={column.title} key={column.id ?? i}>
                <h2 className="mb-2 text-base font-medium leading-[1.3] text-black">{column.title}</h2>
                <ul className="mb-8 flex flex-col">
                  {(column.links ?? []).map(({ link, image, id }, j) => (
                    <li key={id ?? j}>
                      {image ? (
                        <CMSLink
                          {...link}
                          appearance="inline"
                          className="mt-0 inline-block max-md:pb-2 md:mt-2"
                          label={null}
                        >
                          <Picture alt={link.label} className="h-9 w-auto" image={image} />
                        </CMSLink>
                      ) : (
                        <CMSLink
                          {...link}
                          appearance="inline"
                          className={cn(underline, 'text-sm font-light leading-normal hover:text-black md:mt-2 md:text-base')}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-lilac-100 py-8 text-xs font-light leading-normal">
        <div className="container flex flex-wrap items-center justify-center gap-y-2 text-center md:justify-between md:text-left">
          <p className="m-0">{footerData?.legalText}</p>
          {bottomLinks.map(({ link, id }, i) => (
            <CMSLink key={id ?? i} {...link} appearance="inline" className={underline} />
          ))}
        </div>
      </div>
    </footer>
  )
}
