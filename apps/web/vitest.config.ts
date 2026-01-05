import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      thresholds: {
        // Requires 90% function coverage
        functions: 90,

        // Require that no more than 10 lines are uncovered
        lines: -10,
      }
    }
  },
});
