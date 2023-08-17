import { build } from "vite";
import { rimraf } from "rimraf";
import { writeFile } from "node:fs/promises";

const entryPoints = [
  {
    entryAlias: "index",
    entryPath: "src/index.ts",
  },
  {
    entryAlias: "pure",
    entryPath: "src/pure.ts",
  },
  {
    entryAlias: "side-effects",
    entryPath: "src/side-effects.ts",
  },
];

async function buildPackages() {
  await rimraf("dist/umd");
  for (const { entryAlias, entryPath } of entryPoints) {
    await build({
      build: {
        lib: {
          entry: entryPath,
          formats: ["umd"],
          name: "BarcodeDetectionAPI",
          fileName: () => `${entryAlias}.js`,
        },
        outDir: "dist/umd",
        emptyOutDir: false,
      },
      configFile: false,
    });
  }
  await writeFile(
    "dist/umd/package.json",
    JSON.stringify(
      {
        type: "commonjs",
      },
      undefined,
      2
    ) + "\n"
  );
}

buildPackages();
