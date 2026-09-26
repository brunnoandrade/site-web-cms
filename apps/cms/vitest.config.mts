import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./vitest.setup.ts'],
    projects: [
      {
        // Pure unit tests: no database or network required.
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts', 'scripts/**/*.test.ts'],
        },
      },
      {
        // Integration tests: require Postgres/MinIO running (docker compose up -d).
        extends: true,
        test: {
          name: 'int',
          environment: 'node',
          // Each file boots Payload (and checks the schema); in parallel this takes a while.
          hookTimeout: 60_000,
          testTimeout: 30_000,
          include: ['tests/int/**/*.int.spec.ts'],
        },
      },
    ],
  },
})
