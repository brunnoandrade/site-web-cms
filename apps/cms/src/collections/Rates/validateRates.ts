/**
 * Business rules for rate tables, checked before a rates document is published.
 * Drafts may be incomplete; a published document must pass every rule.
 *
 * Initial rules, to be confirmed with the product owner and legal:
 * - R1 at least one rate row;
 * - R2 percentages between 0% and 100%;
 * - R3 a range maximum is not lower than its minimum;
 * - R4 every interest rate comes with the CET (custo efetivo total) of the same period;
 * - R5 the CET is not lower than the interest rate of the same period;
 * - R6 monthly and yearly rates of the same kind agree under monthly compounding
 *   (yearly = (1 + monthly)^12 - 1), within YEARLY_TOLERANCE_PP percentage points;
 * - R7 the validity end date is after the start date;
 * - R8 the legal note is filled in.
 */

export type RateKind = 'interest' | 'cet' | 'fee' | 'other'
export type RatePeriod = 'monthly' | 'yearly' | 'once'
export type RateValueType = 'percent' | 'currency'

export type RateItem = {
  label?: string | null
  kind?: RateKind | null
  period?: RatePeriod | null
  valueType?: RateValueType | null
  value?: number | null
  valueMax?: number | null
}

export type RatesInput = {
  items?: RateItem[] | null
  validFrom?: string | null
  validUntil?: string | null
  legalNote?: string | null
}

export type RateError = { path: string; message: string }

export const YEARLY_TOLERANCE_PP = 0.5

const yearlyFromMonthly = (monthlyPercent: number) => ((1 + monthlyPercent / 100) ** 12 - 1) * 100

const pct = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`

const periodLabel: Record<RatePeriod, string> = {
  monthly: 'mensal',
  yearly: 'anual',
  once: 'única',
}

export function validateRates(input: RatesInput): RateError[] {
  const errors: RateError[] = []
  const items = input.items ?? []

  // R1
  if (items.length === 0) {
    errors.push({ path: 'items', message: 'Inclua pelo menos uma taxa.' })
  }

  items.forEach((item, i) => {
    const path = `items.${i}`
    const { value, valueMax, valueType } = item

    // R2
    if (valueType === 'percent') {
      for (const [field, v] of [
        ['value', value],
        ['valueMax', valueMax],
      ] as const) {
        if (typeof v === 'number' && (v < 0 || v > 100)) {
          errors.push({
            path: `${path}.${field}`,
            message: 'Percentuais devem ficar entre 0% e 100%.',
          })
        }
      }
    }

    // R3
    if (typeof value === 'number' && typeof valueMax === 'number' && valueMax < value) {
      errors.push({
        path: `${path}.valueMax`,
        message: 'O valor máximo não pode ser menor que o mínimo.',
      })
    }
  })

  const percentRows = items
    .map((item, index) => ({ ...item, index }))
    .filter(
      (item): item is typeof item & { value: number; kind: RateKind; period: RatePeriod } =>
        item.valueType === 'percent' &&
        typeof item.value === 'number' &&
        !!item.kind &&
        !!item.period,
    )

  const find = (kind: RateKind, period: RatePeriod) =>
    percentRows.filter((row) => row.kind === kind && row.period === period)

  for (const period of ['monthly', 'yearly'] as const) {
    const interest = find('interest', period)
    const cet = find('cet', period)

    // R4
    if (interest.length > 0 && cet.length === 0) {
      errors.push({
        path: `items.${interest[0]!.index}.kind`,
        message: `Taxa de juros ${periodLabel[period]} sem o CET ${periodLabel[period]} correspondente.`,
      })
    }

    // R5: compare the lowest CET with the highest interest ("a partir de" values).
    if (interest.length > 0 && cet.length > 0) {
      const maxInterest = Math.max(...interest.map((row) => row.value))
      const lowestCet = cet.reduce((a, b) => (b.value < a.value ? b : a))
      if (lowestCet.value < maxInterest) {
        errors.push({
          path: `items.${lowestCet.index}.value`,
          message: `O CET ${periodLabel[period]} (${pct(lowestCet.value)}) não pode ser menor que os juros ${periodLabel[period]} (${pct(maxInterest)}).`,
        })
      }
    }
  }

  // R6
  for (const kind of ['interest', 'cet'] as const) {
    const [monthly] = find(kind, 'monthly')
    const [yearly] = find(kind, 'yearly')
    if (monthly && yearly) {
      const expected = yearlyFromMonthly(monthly.value)
      if (Math.abs(expected - yearly.value) > YEARLY_TOLERANCE_PP) {
        errors.push({
          path: `items.${yearly.index}.value`,
          message: `${kind === 'cet' ? 'CET' : 'Juros'} anual (${pct(yearly.value)}) incoerente com o mensal (${pct(monthly.value)}): o esperado é cerca de ${pct(expected)}.`,
        })
      }
    }
  }

  // R7
  if (
    input.validFrom &&
    input.validUntil &&
    new Date(input.validUntil) <= new Date(input.validFrom)
  ) {
    errors.push({ path: 'validUntil', message: 'O fim da vigência deve ser depois do início.' })
  }

  // R8
  if (!input.legalNote?.trim()) {
    errors.push({ path: 'legalNote', message: 'A nota legal é obrigatória para publicar.' })
  }

  return errors
}
