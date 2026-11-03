import type { Tenant } from '@/lib/cms'

/** Fixed texts of the interface; the property can override each one (tenant "Textos do site"). */
export type UiTexts = {
  readMoreBlog: string
  relatedQuestions: string
  helpTitle: string
  crumbHome: string
  crumbHelp: string
  searchPageTitle: string
  searchSuggestions: string
  searchNoResults: string
  searchClear: string
  popularSearches: string[]
}

export const defaultUiTexts: UiTexts = {
  readMoreBlog: 'Leia no Blog',
  relatedQuestions: 'Assuntos relacionados',
  helpTitle: 'Central de Ajuda',
  crumbHome: 'Home',
  crumbHelp: 'Ajuda',
  searchPageTitle: 'Busca',
  searchSuggestions: 'Sugestões:',
  searchNoResults: 'Nenhuma sugestão encontrada',
  searchClear: 'Limpar busca',
  popularSearches: [],
}

/** The property's texts over the defaults (empty fields keep the default). */
export const uiTextsOf = (tenant: Pick<Tenant, 'uiTexts'>): UiTexts => {
  const own = tenant.uiTexts ?? {}
  const text = <K extends Exclude<keyof UiTexts, 'popularSearches'>>(key: K): string =>
    (own[key] ?? '').trim() || defaultUiTexts[key]
  const terms = (own.popularSearches ?? []).map((item) => item.term.trim()).filter(Boolean)
  return {
    readMoreBlog: text('readMoreBlog'),
    relatedQuestions: text('relatedQuestions'),
    helpTitle: text('helpTitle'),
    crumbHome: text('crumbHome'),
    crumbHelp: text('crumbHelp'),
    searchPageTitle: text('searchPageTitle'),
    searchSuggestions: text('searchSuggestions'),
    searchNoResults: text('searchNoResults'),
    searchClear: text('searchClear'),
    popularSearches: terms,
  }
}
