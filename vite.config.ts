/// <reference types="@vitest/browser/providers/playwright" />
import { coverageConfigDefaults, defineConfig } from "vitest/config";
import { config } from "./package.json";

export default defineConfig({
  build: {
    target: ["es2020", "edge88", "firefox68", "chrome75", "safari13"],
    lib: {
      entry: {
        index: "src/index.ts",
        ponyfill: "src/ponyfill.ts",
        polyfill: "src/polyfill.ts",
      },
      formats: ["es"],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    outDir: "dist/es",
  },
  server: {
    host: "127.0.0.1",
  },
  worker: {
    format: "es",
  },
  test: {
    includeTaskLocation: true,
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [
        {
          browser: "chromium",
        },
        // {
        //   browser: "firefox",
        // },
      ],
      screenshotFailures: false,
    },
    coverage: {
      provider: "istanbul",
      exclude: ["./scripts/**", ...coverageConfigDefaults.exclude],
    },
  },
  define: {
    __PORT__: JSON.stringify(config.port),
  },
});
