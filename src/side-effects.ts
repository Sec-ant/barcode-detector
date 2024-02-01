import { BarcodeDetector } from "./BarcodeDetector.js";
export { setZXingModuleOverrides } from "./BarcodeDetector.js";

declare global {
  // biome-ignore lint/style/noVar: let or const doesn't do the trick
  // biome-ignore lint/suspicious/noRedeclare: we need both var and type
  var BarcodeDetector: typeof import("./BarcodeDetector.js").BarcodeDetector;
  // biome-ignore lint/suspicious/noRedeclare: we need both var and type
  type BarcodeDetector = import("./BarcodeDetector.js").BarcodeDetector;
  type BarcodeFormat = import("./BarcodeDetector.js").BarcodeFormat;
  type BarcodeDetectorOptions =
    import("./BarcodeDetector.js").BarcodeDetectorOptions;
  type DetectedBarcode = import("./BarcodeDetector.js").DetectedBarcode;
}

globalThis.BarcodeDetector ??= BarcodeDetector;
