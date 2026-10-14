import type React from 'react'

import { Footer as DigioFooter } from './digio/Footer'
import { Header as DigioHeader } from './digio/Header'
import { Footer as UberContaFooter } from './uber-conta/Footer'
import { Header as UberContaHeader } from './uber-conta/Header'

/**
 * Menu and footer structure per property. Each layout reads the same `header` and `footer`
 * documents of the tenant, so content is edited in the CMS; the markup is code.
 *
 * Adding a layout: create `layouts/<key>/{Header,Footer}.tsx`, register it here and add the
 * option in apps/cms/src/collections/Tenants (`layout`).
 */
export type TenantChromeProps = { tenant: string }

export type SiteLayout = {
  Header: (props: TenantChromeProps) => Promise<React.ReactNode> | React.ReactNode
  Footer: (props: TenantChromeProps) => Promise<React.ReactNode> | React.ReactNode
}

const layouts = {
  digio: { Header: DigioHeader, Footer: DigioFooter },
  'uber-conta': { Header: UberContaHeader, Footer: UberContaFooter },
} satisfies Record<string, SiteLayout>

export type LayoutKey = keyof typeof layouts

/** Layout of the tenant; unknown keys fall back to Digio. */
export const getLayout = (key?: string | null): SiteLayout =>
  layouts[key as LayoutKey] ?? layouts.digio
