import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { buttonVariants } from '@/components/ui/buttonVariants'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  page: number
  totalPages: number
  /** URL of a page number (page 1 is the listing itself). */
  hrefFor: (page: number) => string
  /** `uber`: the Uber Conta site's (Bootstrap) pager, a joined button group with every page. */
  variant?: 'default' | 'uber'
}

/**
 * Uber Conta pager (current site: `.blog-listing__pagination` + Bootstrap `.pagination`): Anterior,
 * every page number and Próxima in one joined group (6px outer radius, #ddd borders, black text,
 * active page white on black, disabled ends on #e9ecef). Same links and URLs as the default pager.
 */
const UberPagination: React.FC<Omit<Props, 'variant'>> = ({
  className,
  page,
  totalPages,
  hrefFor,
}) => {
  const item =
    'relative block border border-[#ddd] bg-white px-3 py-1.5 text-base font-normal text-black no-underline transition-colors duration-150 motion-reduce:transition-none hover:z-[2] hover:bg-[#f3f3f3] focus:z-[3] focus:bg-[#e9ecef] focus:shadow-[0_0_0_0.25rem_rgba(0,0,0,0.25)] focus:outline-none'
  const entry = (
    key: string,
    n: number,
    label: string,
    opts: { active?: boolean; disabled?: boolean; rel?: string; ariaLabel?: string } = {},
  ) => (
    <li
      className="[&:not(:first-child)>*]:-ml-px [&:first-child>*]:rounded-l-[0.375rem] [&:last-child>*]:rounded-r-[0.375rem]"
      key={key}
    >
      {opts.disabled ? (
        <span aria-disabled className={cn(item, 'bg-[#e9ecef] text-black/75')}>
          {label}
        </span>
      ) : (
        <Link
          aria-current={opts.active ? 'page' : undefined}
          aria-label={opts.ariaLabel}
          className={cn(
            item,
            opts.active && 'z-[3] border-black bg-black text-white hover:bg-black focus:bg-black',
          )}
          href={hrefFor(n)}
          rel={opts.rel}
        >
          {label}
        </Link>
      )}
    </li>
  )

  return (
    <nav aria-label="Paginação do blog" className={cn('mt-8', className)}>
      <ul className="m-0 flex list-none justify-center p-0">
        {entry('prev', page - 1, 'Anterior', { disabled: page <= 1, rel: 'prev' })}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) =>
          entry(String(n), n, String(n), { active: n === page, ariaLabel: `Página ${n}` }),
        )}
        {entry('next', page + 1, 'Próxima', { disabled: page >= totalPages, rel: 'next' })}
      </ul>
    </nav>
  )
}

/**
 * Real links (crawlable, work without JavaScript), keeping the WordPress pagination URLs
 * (/blog/page/2/, /blog/<categoria>/page/2/).
 */
export const Pagination: React.FC<Props> = ({ className, page, totalPages, hrefFor, variant }) => {
  if (totalPages <= 1) return null
  if (variant === 'uber') return <UberPagination {...{ className, page, totalPages, hrefFor }} />

  const pages = [page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages)
  const link = (n: number, children: React.ReactNode, label?: string) => (
    <Link
      aria-current={n === page ? 'page' : undefined}
      aria-label={label}
      className={cn(buttonVariants({ size: 'icon', variant: n === page ? 'outline' : 'ghost' }))}
      href={hrefFor(n)}
    >
      {children}
    </Link>
  )

  return (
    <nav aria-label="Paginação" className={cn('my-12 flex justify-center', className)}>
      <ul className="flex flex-row items-center gap-1">
        {page > 1 && (
          <li>
            <Link
              className={cn(buttonVariants({ size: 'default', variant: 'ghost' }), 'gap-1 pl-2.5')}
              href={hrefFor(page - 1)}
              rel="prev"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
              <span>Anterior</span>
            </Link>
          </li>
        )}
        {pages[0]! > 1 && <li aria-hidden>…</li>}
        {pages.map((n) => (
          <li key={n}>{link(n, n, `Página ${n}`)}</li>
        ))}
        {pages[pages.length - 1]! < totalPages && <li aria-hidden>…</li>}
        {page < totalPages && (
          <li>
            <Link
              className={cn(buttonVariants({ size: 'default', variant: 'ghost' }), 'gap-1 pr-2.5')}
              href={hrefFor(page + 1)}
              rel="next"
            >
              <span>Próxima</span>
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
