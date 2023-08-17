import { test, assert, describe } from "vitest";
import toc from "./samples/toc.json";
import { getHTMLImage } from "./helpers.js";
import { BarcodeDetector } from "../dist/es/index.js";

const barcodeDetector = new BarcodeDetector();

toc.forEach((e) => {
  describe(`detect ${e[0]}`, () => {
    (e[1] as string[]).forEach((f) => {
      test(`detect ${f}`, async () => {
        const image = await getHTMLImage(
          new URL(`./samples/${f}`, import.meta.url).href
        );
        const value =
          (await fetch(image.src.replace(/\.(png|jpg)$/, ".txt")).then((e) =>
            e.text()
          )) || undefined;
        const detectedBarcodes = await barcodeDetector.detect(image);
        assert.equal(detectedBarcodes[0]?.rawValue, value, `\n${image.src}\n`);
      });
    });
  });
});
