import type { Field } from 'payload'

import { t } from '../utilities/labels'

/**
 * Icons available to editors (rendered with lucide-react in apps/web/src/components/Icon).
 * Keep both lists in sync.
 */
export const ICONS = [
  { value: 'credit-card', label: t('Cartão', 'Card') },
  { value: 'qr-code', label: 'Pix / QR Code' },
  { value: 'wallet', label: t('Carteira', 'Wallet') },
  { value: 'piggy-bank', label: t('Investimento', 'Investment') },
  { value: 'banknote', label: t('Dinheiro', 'Money') },
  { value: 'receipt', label: t('Boleto / contas', 'Bills') },
  { value: 'smartphone', label: t('Celular', 'Phone') },
  { value: 'shield-check', label: t('Segurança', 'Security') },
  { value: 'car', label: t('Veículo', 'Vehicle') },
  { value: 'percent', label: t('Desconto / taxa', 'Discount / rate') },
  { value: 'gift', label: t('Benefício', 'Benefit') },
  { value: 'arrow-left-right', label: t('Transferência', 'Transfer') },
  { value: 'clock', label: t('Atendimento 24h', '24h support') },
  { value: 'landmark', label: t('Banco', 'Bank') },
] as const

export const iconField = (overrides: Partial<Field> = {}): Field =>
  ({
    name: 'icon',
    label: t('Ícone', 'Icon'),
    type: 'select',
    options: ICONS.map(({ value, label }) => ({ value, label })),
    ...overrides,
  }) as Field
