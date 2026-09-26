import React from 'react'

import type { Rate, RatesTableBlock as RatesTableBlockProps } from '@digio/payload-types'

type Item = NonNullable<Rate['items']>[number]

const periodSuffix: Record<Item['period'], string> = {
  monthly: 'ao mês',
  yearly: 'ao ano',
  once: '',
}

const formatNumber = (value: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "1,99% a 6,99% ao mês", "R$ 0,00", "a partir de 2,20% ao mês" */
export const formatRate = ({ value, valueMax, valueType, period }: Item) => {
  const format = (v: number) =>
    valueType === 'currency' ? `R$ ${formatNumber(v)}` : `${formatNumber(v)}%`
  const range =
    typeof valueMax === 'number' && valueMax > value
      ? `${format(value)} a ${format(valueMax)}`
      : format(value)
  return [range, periodSuffix[period]].filter(Boolean).join(' ')
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

export const RatesTableBlock: React.FC<RatesTableBlockProps> = ({ heading, rates }) => {
  // Unpublished or deleted tables are not populated: render nothing rather than stale rates.
  if (!rates || typeof rates !== 'object' || !rates.items?.length) return null

  return (
    <section className="container">
      <div className="max-w-3xl">
        <table className="w-full border-collapse text-left">
          <caption className="mb-4 text-left text-2xl font-semibold">
            {heading || rates.title}
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-2 pr-4">
                Descrição
              </th>
              <th scope="col" className="py-2">
                Taxa
              </th>
            </tr>
          </thead>
          <tbody>
            {rates.items.map((item, i) => (
              <tr key={item.id ?? i} className="border-b border-border">
                <th scope="row" className="py-2 pr-4 font-normal">
                  {item.label}
                </th>
                <td className="py-2">{formatRate(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-muted-foreground">
          Vigência a partir de {formatDate(rates.validFrom)}
          {rates.validUntil ? ` até ${formatDate(rates.validUntil)}` : ''}.
          {rates.legalNote ? ` ${rates.legalNote}` : ''}
        </p>
      </div>
    </section>
  )
}
