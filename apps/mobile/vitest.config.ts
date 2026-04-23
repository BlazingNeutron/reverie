import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { reactNative } from '@srsholmes/vitest-react-native';

export default defineConfig({
  plugins: [react(), reactNative()],
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.tsx'],

    coverage: {
      include: ['**/*.tsx'],
      exclude: ['node_modules/**', '__mocks__/**', '__tests__/**'],
      reporter: ['text', 'lcov', 'istanbul-reporter-html-dark'],
    },
  },
});
