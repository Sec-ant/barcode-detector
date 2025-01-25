import { BarcodeDetector } from "./core.js";

declare global {
  // biome-ignore lint/style/noVar: let or const doesn't do the trick
  // biome-ignore lint/suspicious/noRedeclare: we need both var and type
  var BarcodeDetector: typeof import("./core.js").BarcodeDetector;
  // biome-ignore lint/suspicious/noRedeclare: we need both var and type
  type BarcodeDetector = import("./core.js").BarcodeDetector;
  type BarcodeFormat = import("./core.js").BarcodeFormat;
  type BarcodeDetectorOptions = import("./core.js").BarcodeDetectorOptions;
  type DetectedBarcode = import("./core.js").DetectedBarcode;
}

globalThis.BarcodeDetector ??= BarcodeDetector;

export * from "./zxing-exported.js";
