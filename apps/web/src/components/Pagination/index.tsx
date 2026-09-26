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
}

/**
 * Real links (crawlable, work without JavaScript), keeping the WordPress pagination URLs
 * (/blog/page/2/, /blog/<categoria>/page/2/).
 */
export const Pagination: React.FC<Props> = ({ className, page, totalPages, hrefFor }) => {
  if (totalPages <= 1) return null

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
