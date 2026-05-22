import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts', 'packages/*/test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        'packages/*/src/**/*.test.ts',
        'packages/*/src/**/*.d.ts',
        'packages/*/src/index.ts',
        'packages/*/src/__snapshots__/**',
      ],
      thresholds: {
        // Hard floor across sdk + spec; CLI is still scaffolding.
        'packages/sdk/src/**/*.ts': { lines: 80, functions: 80, statements: 80, branches: 55 },
        'packages/spec/src/**/*.ts': { lines: 80, functions: 80, statements: 80, branches: 70 },
      },
    },
  },
});
