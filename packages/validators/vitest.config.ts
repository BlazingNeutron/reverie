import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/**/*.it.{test,spec}.{ts,tsx}"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
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
