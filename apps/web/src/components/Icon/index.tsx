import {
  ArrowLeftRight,
  Banknote,
  Car,
  Clock,
  CreditCard,
  Gift,
  Landmark,
  Percent,
  PiggyBank,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
  type LucideProps,
} from 'lucide-react'
import React from 'react'

// Same names as the CMS icon field (apps/cms/src/fields/icon.ts). Keep both lists in sync.
const icons = {
  'arrow-left-right': ArrowLeftRight,
  banknote: Banknote,
  car: Car,
  clock: Clock,
  'credit-card': CreditCard,
  gift: Gift,
  landmark: Landmark,
  percent: Percent,
  'piggy-bank': PiggyBank,
  'qr-code': QrCode,
  receipt: Receipt,
  'shield-check': ShieldCheck,
  smartphone: Smartphone,
  wallet: Wallet,
} as const

export type IconName = keyof typeof icons

/** Decorative icon (hidden from screen readers; the text next to it carries the meaning). */
export const Icon: React.FC<{ name?: string | null } & LucideProps> = ({ name, ...props }) => {
  const Component = name ? icons[name as IconName] : undefined
  return Component ? <Component aria-hidden focusable={false} {...props} /> : null
}
