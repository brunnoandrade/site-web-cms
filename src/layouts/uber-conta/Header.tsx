import React from 'react'

import { findOne } from '@/lib/cms'
import { requireTenant } from '@/lib/tenant'

import { HeaderClient } from './Header.client'

export async function Header({ tenant }: { tenant: string }) {
  const [headerData, { name }] = await Promise.all([
    findOne('header', { tenant, depth: 1 }),
    requireTenant(tenant),
  ])

  return <HeaderClient data={headerData ?? {}} siteName={name} />
}
