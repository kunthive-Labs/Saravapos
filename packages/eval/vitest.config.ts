import { defineConfig } from 'vitest/config';

// Package-local config so `vitest run` from this package (and `prepublishOnly`)
// resolves its own tests. The repo-root vitest.config.ts still runs the whole
// suite plus coverage.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
