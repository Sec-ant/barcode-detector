export interface EngineRegistry {
  Native: string;
}

type Point2D = { x: number; y: number };

export type BarcodeFormat =
  | "aztec"
  | "code_128"
  | "code_39"
  | "code_93"
  | "codabar"
  | "data_matrix"
  | "ean_13"
  | "ean_8"
  | "itf"
  | "pdf417"
  | "qr_code"
  | "unknown"
  | "upc_a"
  | "upc_e";

/**
 * @see https://wicg.github.io/shape-detection-api/#detectedbarcode-section
 */
export interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  cornerPoints: Array<Point2D>;
  format: BarcodeFormat;
  rawValue: string;
}

export enum Orientation {
  UNKNOWN = -1,
  UPRIGHT,
  ROTATED_RIGHT,
  UPSIDE_DOWN,
  ROTATED_LEFT,
}

export class BarcodeDetectorX {}
