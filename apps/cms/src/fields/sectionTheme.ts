import type { Field } from 'payload'

import { t } from '../utilities/labels'

/** Section backgrounds of the Digio design system (apps/web/src/components/Section). */
export const SECTION_THEMES = ['light', 'lilac', 'navy', 'blue'] as const
export type SectionTheme = (typeof SECTION_THEMES)[number]

export const sectionTheme = (defaultValue: SectionTheme = 'light'): Field => ({
  name: 'theme',
  label: t('Fundo da seção', 'Section background'),
  type: 'select',
  defaultValue,
  options: [
    { label: t('Branco', 'White'), value: 'light' },
    { label: t('Lilás claro', 'Light lilac'), value: 'lilac' },
    { label: t('Azul-marinho', 'Navy'), value: 'navy' },
    { label: t('Azul', 'Blue'), value: 'blue' },
  ],
})
