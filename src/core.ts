import {
  type ReadResult,
  type ReaderOptions,
  prepareZXingModule,
  readBarcodes,
} from "zxing-wasm/reader";
import {
  addPrefixToExceptionOrError,
  getImageDataOrBlobFromImageBitmapSource,
} from "./utils.js";
import {
  BARCODE_FORMATS,
  type BarcodeFormat,
  type ImageBitmapSourceWebCodecs,
  type ReadResultBarcodeFormat,
  convertFormat,
  formatMap,
} from "./utils.js";

export type { BarcodeFormat } from "./utils.js";

export interface BarcodeDetectorOptions {
  formats?: BarcodeFormat[];
  parameters?: BarcodeDetectorParameters;
}

export interface BarcodeDetectorParameters {
  isPure?: boolean;
  maxNumberOfSymbols?: number;
  minLineCount?: number;
  returnErrors?: boolean;
  textMode?: "Plain" | "ECI" | "HRI" | "Hex" | "Escaped";
  tryCode39ExtendedMode?: boolean;
  tryDenoise?: boolean;
  tryDownscale?: boolean;
  tryHarder?: boolean;
  tryInvert?: boolean;
  tryRotate?: boolean;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  rawValue: string;
  format: ReadResultBarcodeFormat;
  cornerPoints: [Point2D, Point2D, Point2D, Point2D];
}

export class BarcodeDetector {
  #formats: BarcodeFormat[];
  #detectorOptions: BarcodeDetectorParameters;

  private defaultReaderOptions: ReaderOptions = {
    tryCode39ExtendedMode: false,
    textMode: "Plain",
  };

  constructor(barcodeDectorOptions: BarcodeDetectorOptions = {}) {
    try {
      // TODO(https://github.com/WICG/shape-detection-api/issues/66):
      // Potentially process UNKNOWN as platform-specific formats.
      const formats = barcodeDectorOptions?.formats?.filter(
        (f) => f !== "unknown",
      );
      if (formats?.length === 0) {
        throw new TypeError("Hint option provided, but is empty.");
      }
      for (const format of formats ?? []) {
        if (!formatMap.has(format)) {
          throw new TypeError(
            `Failed to read the 'formats' property from 'BarcodeDetectorOptions': The provided value '${format}' is not a valid enum value of type BarcodeFormat.`,
          );
        }
      }
      this.#formats = formats ?? [];
      this.#detectorOptions =
        barcodeDectorOptions?.parameters ?? this.defaultReaderOptions;
      // Use eager loading so that a user can fetch and init the wasm
      // before running actual detections, therefore shorten the cold start
      // of the first detection.
      prepareZXingModule({ fireImmediately: true }).catch(() => {});
    } catch (e) {
      throw addPrefixToExceptionOrError(
        e,
        "Failed to construct 'BarcodeDetector'",
      );
    }
  }
  static async getSupportedFormats(): Promise<readonly BarcodeFormat[]> {
    return BARCODE_FORMATS.filter((f) => f !== "unknown");
  }
  async detect(image: ImageBitmapSourceWebCodecs): Promise<DetectedBarcode[]> {
    try {
      const imageDataOrBlob =
        await getImageDataOrBlobFromImageBitmapSource(image);
      // `null` indicates that the image has zero width or height
      if (imageDataOrBlob === null) {
        return [];
      }
      let zxingReadOutputs: ReadResult[];

      const formats = this.#formats.map((format) => formatMap.get(format)!);
      const readerOptions: ReaderOptions = {
        ...this.#detectorOptions,
        formats: formats,
      };

      try {
        zxingReadOutputs = await readBarcodes(imageDataOrBlob, readerOptions);
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
    } catch (e) {
      throw addPrefixToExceptionOrError(
        e,
        "Failed to execute 'detect' on 'BarcodeDetector'",
      );
    }
  }

  getOptions(): BarcodeDetectorOptions {
    return {
      formats: this.#formats,
      parameters: this.#detectorOptions,
    };
  }
}
