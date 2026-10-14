import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'

import { Picture } from './Picture'

/** Uber Conta footer: logo and highlight image on the left, link columns (text or store badges) and a bottom bar. */
export async function Footer({ tenant }: { tenant: string }) {
  const [footerData, { name }] = await Promise.all([
    findOne('footer', { tenant, depth: 1 }),
    requireTenant(tenant),
  ])

  const columns = footerData?.columns ?? []
  const bottomLinks = footerData?.navItems ?? []

  return (
    <footer className="mt-auto bg-navy-900 text-white">
      <div className="container grid gap-10 py-16 lg:grid-cols-[1fr_3fr]">
        <div className="space-y-6">
          <Link aria-label={`${name}, página inicial`} className="inline-block" href="/">
            <Picture alt={name} className="h-7 w-auto" image={footerData?.logo} mobile={footerData?.logoMobile} />
          </Link>
          <Picture alt="" className="h-auto max-w-[14rem]" image={footerData?.highlightImage} />
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-3">
          {columns.map((column, i) => (
            <nav aria-label={column.title} key={column.id ?? i}>
              <h2 className="mb-3 text-sm font-semibold text-white/60">{column.title}</h2>
              <ul className="space-y-3">
                {(column.links ?? []).map(({ link, image, id }, j) => (
                  <li key={id ?? j}>
                    {image ? (
                      <CMSLink {...link} appearance="inline" className="inline-block">
                        <Picture alt={link.label} className="h-10 w-auto" image={image} />
                      </CMSLink>
                    ) : (
                      <CMSLink {...link} appearance="inline" className="text-sm hover:underline" />
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
          <p>{footerData?.legalText}</p>
          <div className="flex flex-wrap items-center gap-4">
            {bottomLinks.map(({ link, id }, i) => (
              <CMSLink key={id ?? i} {...link} appearance="inline" className="hover:underline" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
