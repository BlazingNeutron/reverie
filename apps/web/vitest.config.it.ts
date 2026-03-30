import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  //TODO look at which server is running and maybe set SITE_URL
  // inside devcontainer running dev - localhost:5173
  // inside devcontainer running api on host - 172.17.0.1:3000
  // outside container during integration tests - localhost:3000
  const isDevContainer =
    process.env.CODESPACES === "true" || process.env.DEVCONTAINER !== undefined;

  const envMode = isDevContainer ? "dev" : "it";

  return {
    test: {
      environment: "jsdom",
      globals: true,
      include: ["src/**/*.it.{test,spec}.{ts,tsx}"],
      env: loadEnv(envMode, process.cwd(), ""),
      setupFiles: "src/setupTests.it.ts",
    },
  };
});
