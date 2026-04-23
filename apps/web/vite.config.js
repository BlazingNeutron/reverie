import { defineConfig } from "vite";
import { rnw } from "vite-plugin-rnw";

export default defineConfig({
  plugins: [rnw()],
  define: {
    "process.env.SITE_URL": JSON.stringify(process.env.SITE_URL),
  },
  output: {
    codeSplitting: {
      groups: [
        {
          name: "large-libs",
          test: /node_modules/,
          minSize: 100000, // 100KB
          maxSize: 250000, // 250KB
          priority: 10,
        },
      ],
    },
  },
  server: {
    host: true,
    proxy: {
      "/auth": {
        rewrite: (path) => path.replace(/^\/auth\/v1/, ""),
        target: "http://auth:9999",
        changeOrigin: true,
      },
      "/rest": {
        rewrite: (path) => path.replace(/^\/rest\/v1/, ""),
        target: "http://rest:3000",
        changeOrigin: true,
      },
      "/realtime/v1/api": {
        rewrite: (path) => path.replace(/^\/realtime\/v1/, ""),
        target: "http://realtime-dev:4000",
        changeOrigin: true,
      },
      "/realtime/v1/websocket": {
        ws: true,
        rewriteWsOrigin: true,
        rewrite: (path) => path.replace(/^\/realtime\/v1/, ""),
        target: "http://realtime-dev:4000/socket",
        changeOrigin: true,
      },
      "/api/v1": {
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
