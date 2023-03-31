import { BarcodeFormat } from "./engines/Native.js";
import { ZBarBarcodeFormat } from "./engines/ZBar.js";

type BarcodeFormatX = BarcodeFormat | ZBarBarcodeFormat;

type Point2D = { x: number; y: number };

export interface DetectedBarcodeX<F extends BarcodeFormatX> {
  boundingBox: DOMRectReadOnly;
  cornerPoints: Point2D[];
  format: F;
  rawValue: string;
}

export interface BarcodeDetectorOptionsX<F extends BarcodeFormatX> {
  formats: readonly F[];
}

export function BarcodeDetectorClassGenerator<F extends BarcodeFormatX>() {
  abstract class BarcodeDetectorX {
    static getSupportedFormats: () => Promise<readonly F[]>;
    async detect(
      _: ImageBitmapSourceWebCodecs
    ): Promise<DetectedBarcodeX<F>[]> {
      return [];
    }
  }
  return BarcodeDetectorX;
}
