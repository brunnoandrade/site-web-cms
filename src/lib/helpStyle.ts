import type { Tenant } from '@/lib/cms'

/**
 * Structure of the help center, a policy of the property (`helpStyle`): "topics"
 * (/central-de-ajuda/<topic>/<question>/) or "flat" (/central-de-ajuda/<question>, categories in
 * ?slug=, own search page). Flat is the Uber Conta form.
 */
export const hasFlatHelp = (tenant: Pick<Tenant, 'helpStyle'>) => tenant.helpStyle === 'flat'

/** Site search of the property for the structured data (SearchAction); none without one. */
export const siteSearchPath = (tenant: Pick<Tenant, 'helpStyle'>) =>
  hasFlatHelp(tenant) ? '/central-de-ajuda/busca' : undefined

/** Language of the property's content (BCP 47). */
export const localeOf = (tenant: Pick<Tenant, 'locale'>) => tenant.locale || 'pt-BR'
