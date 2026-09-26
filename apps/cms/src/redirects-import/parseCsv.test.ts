import { describe, expect, it } from 'vitest'

import { parseRedirectCsv } from './parseCsv'

describe('parseRedirectCsv', () => {
  it('reads the English header with defaults', () => {
    const { rows, errors } = parseRedirectCsv('from,to\n/a,/b/\n')
    expect(errors).toEqual([])
    expect(rows).toEqual([{ line: 2, from: '/a', to: '/b/', type: '301', active: true }])
  })

  it('reads Portuguese headers, semicolons, BOM and optional columns', () => {
    const csv = '﻿origem;destino;tipo;onda;ativo;propriedade\n/a/;https://x.com/;302;2;não;digio\n'
    expect(parseRedirectCsv(csv).rows).toEqual([
      {
        line: 2,
        from: '/a/',
        to: 'https://x.com/',
        type: '302',
        wave: '2',
        active: false,
        tenant: 'digio',
      },
    ])
  })

  it('handles quoted values with commas', () => {
    const { rows } = parseRedirectCsv('from,to\n"/busca,antiga/","/b/?q=1,2"\n')
    expect(rows[0]).toMatchObject({ from: '/busca,antiga/', to: '/b/?q=1,2' })
  })

  it('reports invalid rows with their line numbers and keeps the valid ones', () => {
    const csv = [
      'from,to,type,wave,active',
      '/ok/,/b/,,,',
      ',/b/,,,',
      '/c/,,,,',
      '/d/,/e/,307,,',
      '/f/,/g/,,9,',
      '/h/,/i/,,,talvez',
    ].join('\n')
    const { rows, errors } = parseRedirectCsv(csv)
    expect(rows.map((row) => row.from)).toEqual(['/ok/'])
    expect(errors.map((error) => error.line)).toEqual([3, 4, 5, 6, 7])
  })
})
