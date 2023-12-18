import { BarcodeDetector } from "./BarcodeDetector.js";
export { setZXingModuleOverrides } from "./BarcodeDetector.js";

declare global {
  // eslint-disable-next-line no-var
  var BarcodeDetector: typeof import("./BarcodeDetector.js").BarcodeDetector;
  type BarcodeDetector = import("./BarcodeDetector.js").BarcodeDetector;
  type BarcodeFormat = import("./BarcodeDetector.js").BarcodeFormat;
  type BarcodeDetectorOptions =
    import("./BarcodeDetector.js").BarcodeDetectorOptions;
  type DetectedBarcode = import("./BarcodeDetector.js").DetectedBarcode;
}

globalThis.BarcodeDetector ??= BarcodeDetector;
