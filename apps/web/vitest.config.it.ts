import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.it.{test,spec}.{ts,tsx}'],
    env: loadEnv('it', process.cwd(), ''),
    setupFiles: "src/setupTests.it.ts"
  },
}));
