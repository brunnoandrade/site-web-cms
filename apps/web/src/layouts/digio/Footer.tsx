import type { Footer as FooterType } from '@digio/payload-types'

import { findOne } from '@/lib/cms'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

/** Footer: link columns (Uber Conta pattern) on light lilac, legal text and bottom links. */
export async function Footer({ tenant }: { tenant: string }) {
  const footerData: Partial<FooterType> = (await findOne('footer', { tenant, depth: 1 })) ?? {}

  const columns = footerData.columns ?? []
  const navItems = footerData.navItems ?? []

  return (
    <footer className="mt-auto bg-lilac-100 text-navy-900">
      <div className="container grid gap-10 py-16 md:grid-cols-[1fr_3fr]">
        <Link aria-label="Digio, página inicial" className="self-start" href="/">
          <Logo className="h-10" />
        </Link>

        {columns.length > 0 && (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column, i) => (
              <nav aria-label={column.title} key={column.id ?? i}>
                <h2 className="mb-3 text-sm font-semibold">{column.title}</h2>
                <ul className="space-y-2">
                  {(column.links ?? []).map(({ link }, j) => (
                    <li key={j}>
                      <CMSLink
                        {...link}
                        appearance="inline"
                        className="text-sm text-ink-600 hover:text-navy-900 hover:underline"
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#dde1f3]">
        <div className="container flex flex-col gap-4 py-6 text-xs text-ink-600 md:flex-row md:items-center md:justify-between">
          <p>{footerData.legalText}</p>
          <div className="flex flex-wrap items-center gap-4">
            {navItems.map(({ link }, i) => (
              <CMSLink key={i} {...link} appearance="inline" className="hover:underline" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
