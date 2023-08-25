import { build } from "vite";
import { rimraf } from "rimraf";
import esbuildConfig from "../esbuild.config.json" assert { type: "json" };

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
  await rimraf("dist/iife");
  for (const { entryAlias, entryPath } of entryPoints) {
    await build({
      build: {
        lib: {
          entry: entryPath,
          formats: ["iife"],
          name: "BarcodeDetectionAPI",
          fileName: () => `${entryAlias}.js`,
        },
        outDir: "dist/iife",
        emptyOutDir: false,
      },
      esbuild: esbuildConfig,
      configFile: false,
    });
  }
}

buildPackages();
