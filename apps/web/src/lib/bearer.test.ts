import { describe, expect, it } from 'vitest'

import { isBearer } from './bearer'

describe('isBearer', () => {
  it('accepts the exact bearer token', () => {
    expect(isBearer('Bearer s3cret', 's3cret')).toBe(true)
  })

  it('rejects wrong, missing or empty values', () => {
    expect(isBearer('Bearer other', 's3cret')).toBe(false)
    expect(isBearer('s3cret', 's3cret')).toBe(false)
    expect(isBearer(null, 's3cret')).toBe(false)
    expect(isBearer('Bearer ', '')).toBe(false)
    expect(isBearer('Bearer undefined', undefined)).toBe(false)
  })
})
