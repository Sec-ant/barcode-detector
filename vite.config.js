import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { config } from "./package.json";

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
  },
  plugins: [
    dts({
      clearPureImport: false,
    }),
  ],
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
