import {
  type ReadResult,
  type ReaderOptions,
  type ZXingReaderModule,
  getZXingModule,
  readBarcodesFromImageData,
  readBarcodesFromImageFile,
} from "zxing-wasm/reader";
import {
  addPrefixToExceptionOrError,
  getImageDataOrBlobFromImageBitmapSource,
  isBlob,
} from "./utils.js";
import {
  BARCODE_FORMATS,
  type BarcodeFormat,
  type ReadResultBarcodeFormat,
  convertFormat,
  formatMap,
} from "./utils.js";

export { type BarcodeFormat } from "./utils.js";

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
  format: ReadResultBarcodeFormat;
  cornerPoints: [Point2D, Point2D, Point2D, Point2D];
}

interface CustomEventMap {
  load: CustomEvent<ZXingReaderModule>;
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
      for (const format of formats ?? []) {
        if (!formatMap.has(format)) {
          throw new TypeError(
            `Failed to read the 'formats' property from 'BarcodeDetectorOptions': The provided value '${format}' is not a valid enum value of type BarcodeFormat.`,
          );
        }
      }
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
              detail: zxingModule as ZXingReaderModule,
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
      const readerOptions: ReaderOptions = {
        tryHarder: true,
        // https://github.com/Sec-ant/barcode-detector/issues/91
        returnCodabarStartEnd: true,
        formats: this.#formats.map((format) => formatMap.get(format)!),
      };
      try {
        // if `imageDataOrBlob` is still a blob
        // it means we cannot handle it with our js code
        // so we directly feed it to the wasm module
        if (isBlob(imageDataOrBlob)) {
          zxingReadOutputs = await readBarcodesFromImageFile(
            imageDataOrBlob,
            readerOptions,
          );
        } else {
          zxingReadOutputs = await readBarcodesFromImageData(
            imageDataOrBlob,
            readerOptions,
          );
        }
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
}

export { setZXingModuleOverrides } from "zxing-wasm/reader";
