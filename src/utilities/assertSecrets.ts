const SECRETS = ['PAYLOAD_SECRET', 'PREVIEW_SECRET', 'REVALIDATE_SECRET'] as const

const isWeak = (value: string | undefined) =>
  !value || value.length < 16 || /^(change-?me|secret|password)/i.test(value)

/**
 * Refuses to start a deployed (https) instance with missing, short or placeholder secrets
 * (the `change-me` values of the .env.example files). Local http setups are not affected, and
 * the Docker build, which runs without secrets, is skipped.
 */
export const assertStrongSecrets = (env: Record<string, string | undefined> = process.env): void => {
  if (env.NEXT_PHASE === 'phase-production-build') return
  if (env.NODE_ENV !== 'production' || !env.SERVER_URL?.startsWith('https://')) return

  const weak = SECRETS.filter((name) => isWeak(env[name]))
  if (weak.length > 0) {
    throw new Error(`Weak or missing secrets in a deployed environment: ${weak.join(', ')}`)
  }
}
