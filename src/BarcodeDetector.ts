/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import {
  getImageDataFromImageBitmapSource,
  addPrefixToExceptionOrError,
} from "./utils.js";
import {
  getZXingModule,
  readBarcodesFromImageData,
  ZXingReadInputBarcodeFormat,
  ZXingBarcodeFormat,
  ZXingReadOutput,
  ZXingModule,
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

export interface Point2D {
  x: number;
  y: number;
}

export interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  rawValue: string;
  format: BarcodeFormat;
  cornerPoints: [Point2D, Point2D, Point2D, Point2D];
}

interface CustomEventMap {
  load: CustomEvent<ZXingModule<"reader">>;
  error: CustomEvent<unknown>;
}

type ChangeEventListener = <K extends keyof CustomEventMap>(
  type: K,
  callback:
    | ((evt: CustomEventMap[K]) => void)
    | { handleEvent(evt: CustomEventMap[K]): void }
    | null,
  options?: boolean | AddEventListenerOptions | undefined,
) => void;

export interface BarcodeDetector {
  addEventListener: ChangeEventListener;
  removeEventListener: ChangeEventListener;
}

export class BarcodeDetector extends EventTarget {
  #formats: BarcodeFormat[];
  constructor(barcodeDectorOptions: BarcodeDetectorOptions = {}) {
    super();
    try {
      // TODO(https://github.com/WICG/shape-detection-api/issues/66):
      // Potentially process UNKNOWN as platform-specific formats.
      const formats = barcodeDectorOptions?.formats?.filter(
        (f) => f !== "unknown",
      );
      if (formats?.length === 0) {
        throw new TypeError("Hint option provided, but is empty.");
      }
      formats?.forEach((format) => {
        if (!BARCODE_DETECTOR_FORMATS.includes(format)) {
          throw new TypeError(
            `Failed to read the 'formats' property from 'BarcodeDetectorOptions': The provided value '${format}' is not a valid enum value of type BarcodeFormat.`,
          );
        }
      });
      this.#formats = formats ?? [];
      // Use eager loading so that a user can fetch and init the wasm
      // before running actual detections, therefore shorten the cold start
      // of the first detection. Also we dispatch load and error events
      // so users can add lifecycle hooks if they want. The load event will
      // expose the ZXing module for advanced usage.
      getZXingModule()
        .then((zxingModule) => {
          this.dispatchEvent(
            new CustomEvent("load", {
              detail: zxingModule as ZXingModule<"reader">,
            }),
          );
        })
        .catch((error: unknown) => {
          this.dispatchEvent(new CustomEvent("error", { detail: error }));
        });
    } catch (e) {
      throw addPrefixToExceptionOrError(
        e,
        "Failed to construct 'BarcodeDetector'",
      );
    }
  }
  static async getSupportedFormats(): Promise<readonly BarcodeFormat[]> {
    return BARCODE_DETECTOR_FORMATS.filter((f) => f !== "unknown");
  }
  async detect(image: ImageBitmapSourceWebCodecs): Promise<DetectedBarcode[]> {
    try {
      const imageData = await getImageDataFromImageBitmapSource(image);
      if (imageData === null) {
        return [];
      }
      let zxingReadOutputs: ZXingReadOutput[];
      try {
        zxingReadOutputs = await readBarcodesFromImageData(imageData, {
          tryHarder: true,
          formats: this.#formats.map(
            (format) => formatMap.get(format) as ZXingReadInputBarcodeFormat,
          ),
        });
      } catch (e) {
        // we need this information to debug
        console.error(e);
        throw new DOMException(
          "Barcode detection service unavailable.",
          "NotSupportedError",
        );
      }
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
            maxY - minY,
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
        "Failed to execute 'detect' on 'BarcodeDetector'",
      );
    }
  }
}

export { setZXingModuleOverrides } from "@sec-ant/zxing-wasm";
