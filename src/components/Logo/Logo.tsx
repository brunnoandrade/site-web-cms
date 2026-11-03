import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  /** White logo for dark backgrounds (navy header, dark sections). */
  variant?: 'color' | 'white'
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

/** Digio logo (from the current site, public/brand). */
export const Logo = ({ className, variant = 'color', loading = 'lazy', priority = 'low' }: Props) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img
    alt="Digio"
    width={118}
    height={52}
    loading={loading}
    fetchPriority={priority}
    decoding="async"
    className={clsx('h-8 w-auto', className)}
    src={variant === 'white' ? '/brand/logo-digio-branco.svg' : '/brand/logo-digio.svg'}
  />
)
