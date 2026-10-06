import { createHash, timingSafeEqual } from 'node:crypto'

/** Whether the Authorization header is `Bearer <secret>`, compared in constant time. */
export const isBearer = (header: string | null, secret: string | undefined): boolean => {
  if (!secret || !header) return false
  // Hashing gives both sides the same length, which timingSafeEqual requires.
  const digest = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`))
}
