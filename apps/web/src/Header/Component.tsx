import { HeaderClient } from './Component.client'
import { findOne } from '@/lib/cms'
import React from 'react'

export async function Header({ tenant }: { tenant: string }) {
  const headerData = (await findOne('header', { tenant, depth: 1 })) ?? {}

  return <HeaderClient data={headerData} />
}
