import { fileURLToPath } from "node:url";
import { resolve, relative } from "node:path";
import { readdir, writeFile } from "node:fs/promises";

const samplesDir = fileURLToPath(new URL("../tests/samples", import.meta.url));

await writeFile(
  resolve(samplesDir, "toc.json"),
  JSON.stringify(
    await Promise.all(
      (await readdir(samplesDir, { withFileTypes: true }))
        .filter((e) => e.isDirectory())
        .map((e) => [e.name, resolve(e.path, e.name)])
        .map(async ([n, p]) => [
          n,
          (await readdir(p as string, { withFileTypes: true }))
            .filter(
              (e) =>
                e.isFile() &&
                (e.name.endsWith(".png") || e.name.endsWith(".jpg")),
            )
            .map((e) =>
              relative(samplesDir, resolve(e.path, encodeURIComponent(e.name))),
            ),
        ]),
    ),
  ),
);
