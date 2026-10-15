import type React from 'react'

/**
 * Visual identity per property. Every preset overrides the color tokens of `globals.css`
 * (`@theme`), so the blocks keep their class names (`bg-navy-900`, `text-turquoise-400`, ...) and
 * only the palette changes. Token names are historical: `navy` is the dark section color,
 * `turquoise` the accent on dark backgrounds, `lilac` the light section color.
 *
 * Adding a theme: add the preset here and its option in apps/cms/src/collections/Tenants.
 */
export type ThemePreset = 'digio' | 'uber-conta'

const themes: Record<ThemePreset, Record<string, string>> = {
  // Same values as globals.css: nothing to override.
  digio: {},
  'uber-conta': {
    '--color-navy-950': '#000000',
    '--color-navy-900': '#000000',
    '--color-navy-800': '#1a1a1a',
    '--color-navy-700': '#262626',
    '--color-turquoise-400': '#6f9bf0',
    '--color-turquoise-300': '#9bb9f5',
    '--color-brand-blue': '#2466df',
    '--color-brand-blue-dark': '#1a4fb5',
    '--color-lilac-100': '#e8e8e8',
    '--color-lilac-50': '#f3f3f3',
    '--color-ink-700': '#333333',
    '--color-ink-600': '#595959',
    // Uber Conta buttons: rounded rectangle (.6rem), regular weight, 1.7rem side padding.
    '--button-radius': '0.6rem',
    '--button-weight': '400',
    '--button-px-lg': '1.7rem',
    // Sections: 2.5rem of vertical padding, 6rem from 992px.
    '--section-py': '2.5rem',
    '--section-py-md': '2.5rem',
    '--section-py-lg': '6rem',
    // Typefaces of the current site: Uber Move Text for body copy, Uber Move for headings.
    '--font-sans': "'Uber Move Text', ui-sans-serif, system-ui, sans-serif",
    '--font-heading': "'Uber Move', ui-sans-serif, system-ui, sans-serif",
    // Font weights of the current site (Uber Move Text): light supporting text, regular FAQ
    // questions and links, medium testimonial quotes. Titles stay at 600.
    '--weight-support': '300',
    '--weight-faq': '400',
    '--weight-link': '400',
    '--weight-quote': '500',
  },
}

/** CSS variables of the tenant theme; unknown presets fall back to Digio. */
export const themeStyle = (preset?: string | null): React.CSSProperties =>
  (themes[preset as ThemePreset] ?? themes.digio) as React.CSSProperties
