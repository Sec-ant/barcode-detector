import { getImageDataFromImageBitmapSource } from "./utils.js";
import {
  setZXingModuleOverrides,
  getZXingModule,
  readBarcodesFromImageData,
  ZXingReadInputBarcodeFormat,
  ZXingBarcodeFormat,
} from "@sec-ant/zxing-wasm/reader";

export const BARCODE_DETECTOR_FORMATS = [
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
  "upc_a",
  "upc_e",
  "unknown",
] as const;

export type BarcodeFormat = (typeof BARCODE_DETECTOR_FORMATS)[number];

const formatMap = new Map<BarcodeFormat, ZXingReadInputBarcodeFormat>([
  ["aztec", "Aztec"],
  ["code_128", "Code128"],
  ["code_39", "Code39"],
  ["code_93", "Code93"],
  ["codabar", "Codabar"],
  ["data_matrix", "DataMatrix"],
  ["ean_13", "EAN-13"],
  ["ean_8", "EAN-8"],
  ["itf", "ITF"],
  ["pdf417", "PDF417"],
  ["qr_code", "QRCode"],
  ["upc_a", "UPC-A"],
  ["upc_e", "UPC-E"],
]);

function convertFormat(target: ZXingBarcodeFormat): BarcodeFormat {
  for (const [barcodeFormat, zxingBarcodeFormat] of formatMap) {
    if (target === zxingBarcodeFormat) {
      return barcodeFormat;
    }
  }
  return "unknown";
}

export interface BarcodeDetectorOptions {
  formats?: BarcodeFormat[];
}

type Point2D = {
  x: number;
  y: number;
};

export interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  rawValue: string;
  format: BarcodeFormat;
  cornerPoints: [Point2D, Point2D, Point2D, Point2D];
}

export class BarcodeDetector {
  #formats: BarcodeFormat[];
  constructor(barcodeDectorOptions: BarcodeDetectorOptions = {}) {
    if (barcodeDectorOptions?.formats?.length === 0) {
      throw new TypeError("formats cannot be empty");
    }
    barcodeDectorOptions?.formats?.forEach((format) => {
      if (format === "unknown") {
        throw new TypeError("format unknown is not supported");
      }
      if (!BARCODE_DETECTOR_FORMATS.includes(format)) {
        throw new TypeError(`format ${format} is not supported`);
      }
    });
    getZXingModule();
    this.#formats = barcodeDectorOptions?.formats ?? [];
  }
  static async getSupportedFormats(): Promise<readonly BarcodeFormat[]> {
    await getZXingModule();
    return BARCODE_DETECTOR_FORMATS.filter((f) => f !== "unknown");
  }
  async detect(image: ImageBitmapSourceWebCodecs): Promise<DetectedBarcode[]> {
    const imageData = await getImageDataFromImageBitmapSource(image);
    if (imageData === null) {
      return [];
    }
    const zxingReadOutputs = await readBarcodesFromImageData(imageData, {
      tryHarder: true,
      formats: this.#formats.map(
        (format) => formatMap.get(format) as ZXingReadInputBarcodeFormat
      ),
    });
    return zxingReadOutputs.map((zxingReadOutput) => {
      const {
        topLeft: { x: topLeftX, y: topLeftY },
        topRight: { x: topRightX, y: topRightY },
        bottomLeft: { x: bottomLeftX, y: bottomLeftY },
        bottomRight: { x: bottomRightX, y: bottomRightY },
      } = zxingReadOutput.position;
      const minX = Math.min(topLeftX, topRightX, bottomLeftX, bottomRightX);
      const minY = Math.min(topLeftY, topRightY, bottomLeftY, bottomRightY);
      const maxX = Math.max(topLeftX, topRightX, bottomLeftX, bottomRightX);
      const maxY = Math.max(topLeftY, topRightY, bottomLeftY, bottomRightY);
      return {
        boundingBox: new DOMRectReadOnly(minX, minY, maxX - minX, maxY - minY),
        rawValue: zxingReadOutput.text,
        format: convertFormat(zxingReadOutput.format),
        cornerPoints: [
          {
            x: topLeftX,
            y: topLeftY,
          },
          {
            x: topRightX,
            y: topRightY,
          },
          {
            x: bottomRightX,
            y: bottomRightY,
          },
          {
            x: bottomLeftX,
            y: bottomLeftY,
          },
        ],
      };
    });
  }
}

export { setZXingModuleOverrides };

declare global {
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
