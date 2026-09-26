import React from 'react'

import { cn } from '@/utilities/ui'

/** Section backgrounds of the Digio design system (same options as the CMS `theme` field). */
export type SectionTheme = 'light' | 'lilac' | 'navy' | 'blue'

const themes: Record<SectionTheme, string> = {
  light: 'bg-white text-navy-900',
  lilac: 'bg-lilac-100 text-navy-900',
  navy: 'bg-navy-900 text-white',
  blue: 'bg-brand-blue text-white',
}

export const isDarkTheme = (theme?: SectionTheme | null) => theme === 'navy' || theme === 'blue'

type Props = React.HTMLAttributes<HTMLElement> & {
  theme?: SectionTheme | null
  /** Vertical spacing: default for content sections, none for full-bleed ones. */
  spacing?: 'default' | 'none'
}

export const Section: React.FC<Props> = ({ theme, spacing = 'default', className, children, ...rest }) => (
  <section
    className={cn(themes[theme ?? 'light'], spacing === 'default' && 'py-16 md:py-24', className)}
    data-section-theme={theme ?? 'light'}
    {...rest}
  >
    {children}
  </section>
)

/** Section title: 32px on mobile, 48px on desktop (Uber Conta scale). */
export const SectionHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => (
  <h2 className={cn('text-3xl font-semibold tracking-tight md:text-title', className)} {...rest} />
)
