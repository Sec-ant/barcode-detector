import { assert, describe, test } from "vitest";
import { BarcodeDetector } from "../src/index.js";
import { getHTMLImage } from "./helpers.js";
import toc from "./samples/toc.json";

const barcodeDetector = new BarcodeDetector();
for (const e of toc) {
  describe(`detect ${e[0]}`, () => {
    for (const f of e[1] as string[]) {
      test(`detect ${f}`, async () => {
        const image = await getHTMLImage(
          new URL(`./samples/${f}`, import.meta.url).href,
        );
        const value =
          (await fetch(image.src.replace(/\.(png|jpg)$/, ".txt")).then((e) =>
            e.text(),
          )) || undefined;
        const detectedBarcodes = await barcodeDetector.detect(image);
        assert.equal(detectedBarcodes[0]?.rawValue, value, `\n${image.src}\n`);
      });
    }
  });
}
