import { BarcodeDetector, Point2D } from "./BarcodeDetector.js";
export { setZXingModuleOverrides } from "./BarcodeDetector.js";
import { BARCODE_DETECTOR_FORMATS } from "./utils.js";

declare global {
  // eslint-disable-next-line no-var
  var BarcodeDetector: {
    readonly prototype: BarcodeDetector;
    new (barcodeDectorOptions?: BarcodeDetectorOptions): BarcodeDetector;
    getSupportedFormats(): Promise<readonly BarcodeFormat[]>;
  };
  interface BarcodeDetector {
    detect(image: ImageBitmapSourceWebCodecs): Promise<DetectedBarcode[]>;
  }
  type BarcodeFormat = (typeof BARCODE_DETECTOR_FORMATS)[number];
  interface BarcodeDetectorOptions {
    formats?: BarcodeFormat[];
  }
  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    rawValue: string;
    format: BarcodeFormat;
    cornerPoints: [Point2D, Point2D, Point2D, Point2D];
  }
}

globalThis.BarcodeDetector ??= BarcodeDetector;
