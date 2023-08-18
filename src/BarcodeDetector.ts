import {
  getImageDataFromImageBitmapSource,
  addPrefixToExceptionOrError,
} from "./utils.js";
import {
  setZXingModuleOverrides,
  getZXingModule,
  readBarcodesFromImageData,
  ZXingReadInputBarcodeFormat,
  ZXingBarcodeFormat,
} from "@sec-ant/zxing-wasm/reader";
import { BARCODE_DETECTOR_FORMATS } from "./utils.js";

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

export type Point2D = {
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
    try {
      // TODO(https://github.com/WICG/shape-detection-api/issues/66):
      // potentially process UNKNOWN as platform-specific formats.
      const formats = barcodeDectorOptions?.formats?.filter(
        (f) => f !== "unknown"
      );
      if (formats?.length === 0) {
        throw new TypeError("Hint option provided, but is empty.");
      }
      formats?.forEach((format) => {
        if (!BARCODE_DETECTOR_FORMATS.includes(format)) {
          throw new TypeError(
            `Failed to read the 'formats' property from 'BarcodeDetectorOptions': The provided value '${format}' is not a valid enum value of type BarcodeFormat.`
          );
        }
      });
      getZXingModule();
      this.#formats = formats ?? [];
    } catch (e) {
      throw addPrefixToExceptionOrError(
        e,
        "Failed to construct 'BarcodeDetector'"
      );
    }
  }
  static async getSupportedFormats(): Promise<readonly BarcodeFormat[]> {
    await getZXingModule();
    return BARCODE_DETECTOR_FORMATS.filter((f) => f !== "unknown");
  }
  async detect(image: ImageBitmapSourceWebCodecs): Promise<DetectedBarcode[]> {
    try {
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
          boundingBox: new DOMRectReadOnly(
            minX,
            minY,
            maxX - minX,
            maxY - minY
          ),
          rawValue: new TextDecoder().decode(zxingReadOutput.bytes),
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
    } catch (e) {
      throw addPrefixToExceptionOrError(
        e,
        "Failed to execute 'detect' on 'BarcodeDetector'"
      );
    }
  }
}

export { setZXingModuleOverrides };
