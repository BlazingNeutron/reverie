import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      // Include all source files so untested files are counted in the report
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'node_modules/**'],
      reporter: ['text', 'lcov', 'html'],
      // Keep thresholds optional; adjust as desired
      thresholds: {
        functions: 80,
        lines: 60,
      },
    }
  },
});
