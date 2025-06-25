import { BarcodeDetector as BD } from "./core.js";

declare global {
  var BarcodeDetector: typeof import("./core.js").BarcodeDetector;
  type BarcodeDetector = import("./core.js").BarcodeDetector;
  type BarcodeFormat = import("./core.js").BarcodeFormat;
  type BarcodeDetectorOptions = import("./core.js").BarcodeDetectorOptions;
  type DetectedBarcode = import("./core.js").DetectedBarcode;
}

globalThis.BarcodeDetector ??= BD;

export * from "./zxing-exported.js";
