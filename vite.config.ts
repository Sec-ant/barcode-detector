/// <reference types="vitest" />
import { defineConfig } from "vite";
import { config } from "./package.json";
import esbuildConfig from "./esbuild.config.json";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        pure: "src/pure.ts",
        "side-effects": "src/side-effects.ts",
      },
      formats: ["es"],
    },
    outDir: "dist/es",
  },
  esbuild: esbuildConfig,
  test: {
    browser: {
      enabled: true,
      headless: true,
      name: "chromium",
      provider: "playwright",
    },
    coverage: {
      provider: "istanbul",
    },
  },
  define: {
    __PORT__: JSON.stringify(config.port),
  },
});
