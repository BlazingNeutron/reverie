import tseslint from "typescript-eslint";

declare module 'vite' {
    config: tseslint.config
}