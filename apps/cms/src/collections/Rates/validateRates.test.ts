import { describe, expect, it } from 'vitest'

import { validateRates, type RateItem, type RatesInput } from './validateRates'

const row = (
  kind: RateItem['kind'],
  period: RateItem['period'],
  value: number,
  extra: Partial<RateItem> = {},
): RateItem => ({
  label: `${kind} ${period}`,
  kind,
  period,
  valueType: 'percent',
  value,
  ...extra,
})

// 1.99% a.m. -> 26.68% a.a.; CET 2.20% a.m. -> 29.84% a.a.
const valid: RatesInput = {
  items: [
    row('interest', 'monthly', 1.99),
    row('interest', 'yearly', 26.68),
    row('cet', 'monthly', 2.2),
    row('cet', 'yearly', 29.84),
    { label: 'Tarifa de cadastro', kind: 'fee', period: 'once', valueType: 'currency', value: 0 },
  ],
  validFrom: '2026-10-01',
  validUntil: '2026-12-31',
  legalNote: 'Taxas sujeitas à análise de crédito.',
}

const paths = (input: RatesInput) => validateRates(input).map((error) => error.path)

describe('validateRates', () => {
  it('accepts a consistent table', () => {
    expect(validateRates(valid)).toEqual([])
  })

  it('R1 requires at least one row', () => {
    expect(paths({ ...valid, items: [] })).toContain('items')
  })

  it('R2 rejects percentages outside 0-100%', () => {
    expect(paths({ ...valid, items: [row('fee', 'once', 120)] })).toContain('items.0.value')
  })

  it('R3 rejects a range whose maximum is lower than the minimum', () => {
    expect(paths({ ...valid, items: [row('fee', 'once', 5, { valueMax: 3 })] })).toContain(
      'items.0.valueMax',
    )
  })

  it('R4 requires the CET of the same period as the interest rate', () => {
    const errors = validateRates({ ...valid, items: [row('interest', 'monthly', 1.99)] })
    expect(errors.map((e) => e.path)).toContain('items.0.kind')
    expect(errors[0]?.message).toMatch(/sem o CET mensal/)
  })

  it('R5 rejects a CET lower than the interest rate', () => {
    const errors = validateRates({
      ...valid,
      items: [row('interest', 'monthly', 2.5), row('cet', 'monthly', 2.0)],
    })
    expect(errors.map((e) => e.path)).toContain('items.1.value')
  })

  it('R6 rejects yearly rates inconsistent with the monthly rate', () => {
    const items = [...valid.items!]
    items[1] = row('interest', 'yearly', 23.88) // 1.99 x 12, simple interest: wrong
    expect(paths({ ...valid, items })).toContain('items.1.value')
  })

  it('R6 accepts small rounding differences', () => {
    const items = [...valid.items!]
    items[1] = row('interest', 'yearly', 26.9)
    expect(paths({ ...valid, items })).not.toContain('items.1.value')
  })

  it('R7 requires the end date after the start date', () => {
    expect(paths({ ...valid, validUntil: '2026-09-30' })).toContain('validUntil')
  })

  it('R8 requires the legal note', () => {
    expect(paths({ ...valid, legalNote: '  ' })).toContain('legalNote')
  })
})
