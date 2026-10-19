import { rimraf } from "rimraf";
import { build, type LibraryOptions } from "vite";
import viteConfig from "../vite.config.js";

async function buildIife() {
  await rimraf("dist/iife");
  const lib = viteConfig.build!.lib as LibraryOptions & {
    entry: Record<string, string>;
  };
  await Promise.all(
    Object.entries(lib.entry).map(([entryAlias, entryPath]) => {
      return build({
        ...viteConfig,
        build: {
          ...viteConfig.build,
          lib: {
            ...lib,
            entry: {
              [entryAlias]: entryPath,
            },
            formats: ["iife"],
            name: "BarcodeDetectionAPI",
          },
          rolldownOptions: undefined,
          outDir: "dist/iife",
          emptyOutDir: false,
        },
        test: undefined,
        configFile: false,
      });
    }),
  );
}

buildIife();
