import { paths, urlStyleOf, type UrlStyle } from '@digio/routes'

import type { Tenant } from './cms'

/** URL policy of a tenant (trailing slash, blog URL form). */
export const styleOf = (tenant: Tenant): UrlStyle => urlStyleOf(tenant)

/** Every public URL of a tenant, in its own form (see packages/routes). */
export const pathsOf = (tenant: Tenant) => paths(urlStyleOf(tenant))
