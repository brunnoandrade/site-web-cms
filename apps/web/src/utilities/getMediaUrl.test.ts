import { describe, expect, it } from 'vitest'

import { getMediaUrl } from './getMediaUrl'

describe('getMediaUrl', () => {
  it('returns an empty string when url is missing', () => {
    expect(getMediaUrl(null)).toBe('')
    expect(getMediaUrl(undefined)).toBe('')
  })

  it('keeps local media paths relative', () => {
    expect(getMediaUrl('/api/media/file/hero.webp')).toBe('/api/media/file/hero.webp')
  })

  it('appends an encoded cache tag', () => {
    expect(getMediaUrl('/api/media/file/hero.webp', '2026-09-24 10:00')).toBe(
      '/api/media/file/hero.webp?2026-09-24%2010%3A00',
    )
  })

  it('strips the trailing slash Payload adds to file URLs', () => {
    expect(getMediaUrl('/api/media/file/hero.webp/')).toBe('/api/media/file/hero.webp')
    expect(getMediaUrl('/api/media/file/hero.webp/', 'v1')).toBe('/api/media/file/hero.webp?v1')
    expect(getMediaUrl('https://cdn.digio.com.br/media/hero.webp/?x=1')).toBe(
      'https://cdn.digio.com.br/media/hero.webp?x=1',
    )
  })

  it('keeps the trailing slash on non-file paths', () => {
    expect(getMediaUrl('/blog/noticias/')).toBe('/blog/noticias/')
  })
})
