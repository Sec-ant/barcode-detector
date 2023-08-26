import { build } from "vite";
import { writeFile } from "node:fs/promises";

async function buildPackages() {
  await build({
    build: {
      lib: {
        entry: {
          index: "src/index.ts",
          pure: "src/pure.ts",
          "side-effects": "src/side-effects.ts",
        },
        formats: ["cjs"],
        fileName: (_, entryName) => `${entryName}.js`,
      },
      outDir: "dist/cjs",
    },
    configFile: false,
  });
  await writeFile(
    "dist/cjs/package.json",
    JSON.stringify(
      {
        type: "commonjs",
      },
      undefined,
      2,
    ) + "\n",
  );
}

buildPackages();
