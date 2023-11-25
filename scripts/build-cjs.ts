import { type LibraryOptions, build } from "vite";
import { writeFile } from "node:fs/promises";
import viteConfig from "../vite.config";

async function buildCjs() {
  await build({
    ...viteConfig,
    build: {
      ...viteConfig.build,
      lib: {
        ...(viteConfig.build?.lib as LibraryOptions),
        formats: ["cjs"],
      },
      outDir: "dist/cjs",
    },
    test: undefined,
    configFile: false,
  });
  await writeFile(
    "dist/cjs/package.json",
    JSON.stringify({ type: "commonjs" }, undefined, 2) + "\n",
  );
}

buildCjs();
