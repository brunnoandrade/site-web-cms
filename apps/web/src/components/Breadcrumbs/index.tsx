import Link from 'next/link'
import React from 'react'

export type Crumb = { label: string; href?: string }

/** Breadcrumb trail (WCAG: nav landmark, current page marked with aria-current). */
export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <nav aria-label="Trilha de navegação" className="text-sm text-muted-foreground">
    <ol className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          {i > 0 && <span aria-hidden>/</span>}
          {item.href ? (
            <Link className="hover:underline" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
)
