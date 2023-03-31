import {
  DetectedBarcodeX,
  BarcodeDetectorOptionsX,
  BarcodeDetectorClassGenerator,
} from "../BarcodeDetectorX.js";

const barcodeFormatList = [
  "aztec",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "data_matrix",
  "ean_13",
  "ean_8",
  "itf",
  "pdf417",
  "qr_code",
  "unknown",
  "upc_a",
  "upc_e",
] as const;

/**
 * @see https://wicg.github.io/shape-detection-api/#enumdef-barcodeformat
 */
export type BarcodeFormat = typeof barcodeFormatList[number];

/**
 * @see https://wicg.github.io/shape-detection-api/#detectedbarcode-section
 */
export type DetectedBarcode = DetectedBarcodeX<BarcodeFormat>;

/**
 * @see https://wicg.github.io/shape-detection-api/#dictdef-barcodedetectoroptions
 */
export type BarcodeDetectorOptions = BarcodeDetectorOptionsX<BarcodeFormat>;

export declare class BarcodeDetector extends BarcodeDetectorClassGenerator<BarcodeFormat>() {
  constructor(barcodeDetectorOptions?: BarcodeDetectorOptions);
}
