import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "react-native": "react-native-web",
    },
    environment: "jsdom",
    env: {
      SITE_URL: "http://localhost:3000",
    },
    globals: true,
    setupFiles: "src/setupTests.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/**/*.it.{test,spec}.{ts,tsx}"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/setupTests*.ts",
        "src/**/*.spec.{ts,tsx}",
        "node_modules/**",
        "__mocks__/**",
      ],
      reporter: ["text", "lcov", "istanbul-reporter-html-dark"],
      thresholds: {
        functions: 80,
        lines: 60,
      },
    },
  },
});
