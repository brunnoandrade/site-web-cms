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
    '--color-lilac-50': '#f4f4f4',
    '--color-ink-700': '#333333',
    '--color-ink-600': '#595959',
  },
}

/** CSS variables of the tenant theme; unknown presets fall back to Digio. */
export const themeStyle = (preset?: string | null): React.CSSProperties =>
  (themes[preset as ThemePreset] ?? themes.digio) as React.CSSProperties
