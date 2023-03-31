import {
  ZBarConfigType,
  ZBarSymbolType,
  ZBarScanner,
  scanRGBABuffer,
  ZBarSymbol,
  ZBarOrientation,
} from "@undecaf/zbar-wasm";
import {
  BarcodeDetectorOptionsX,
  DetectedBarcodeX,
  BarcodeDetectorClassGenerator,
} from "../BarcodeDetectorX.js";
import { getImageDataFromImageBitmapSource } from "../utils.js";

export interface EngineRegistry {
  ZBar: string;
}

const zBarBarcodeFormatList = [
  "codabar",
  "code_39",
  "code_93",
  "code_128",
  "databar",
  "databar_exp",
  "ean_2",
  "ean_5",
  "ean_8",
  "ean_13",
  "ean_13+2",
  "ean_13+5",
  "isbn_10",
  "isbn_13",
  "isbn_13+2",
  "isbn_13+5",
  "itf",
  "qr_code",
  "sq_code",
  "upc_a",
  "upc_e",
] as const;

export type ZBarBarcodeFormat = typeof zBarBarcodeFormatList[number];

/**
 * Additional {@link BarcodeDetectorPolyfill} options supported by
 * the underlying ZBar implementation.
 */
export interface ZBarBarcodeDetectorOptions
  extends BarcodeDetectorOptionsX<ZBarBarcodeFormat> {
  // Overrides automatic cache management if specified
  enableCache?: boolean;
  /**
   * Any of https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings;
   * defaults to UTF-8
   */
  encoding?: string;
}

export interface ZBarDetectedBarcode
  extends DetectedBarcodeX<ZBarBarcodeFormat> {
  // @undecaf/zbar-wasm extensions
  orientation: ZBarOrientation;
  quality: number;
}

const formatMap = new Map<
  ZBarBarcodeFormat,
  {
    sym: ZBarSymbolType;
    conf?: ZBarConfigType;
    value?: number;
  }[]
>([
  [
    "codabar",
    [
      {
        sym: ZBarSymbolType.ZBAR_CODABAR,
      },
    ],
  ],
  ["code_39", [{ sym: ZBarSymbolType.ZBAR_CODE39 }]],
  ["code_93", [{ sym: ZBarSymbolType.ZBAR_CODE93 }]],
  ["code_128", [{ sym: ZBarSymbolType.ZBAR_CODE128 }]],
  ["databar", [{ sym: ZBarSymbolType.ZBAR_DATABAR }]],
  ["databar_exp", [{ sym: ZBarSymbolType.ZBAR_DATABAR_EXP }]],
  ["ean_2", [{ sym: ZBarSymbolType.ZBAR_EAN2 }]],
  ["ean_5", [{ sym: ZBarSymbolType.ZBAR_EAN5 }]],
  ["ean_8", [{ sym: ZBarSymbolType.ZBAR_EAN8 }]],
  ["ean_13", [{ sym: ZBarSymbolType.ZBAR_EAN13 }]],
  [
    "ean_13+2",
    [{ sym: ZBarSymbolType.ZBAR_EAN13 }, { sym: ZBarSymbolType.ZBAR_EAN2 }],
  ],
  [
    "ean_13+5",
    [{ sym: ZBarSymbolType.ZBAR_EAN13 }, { sym: ZBarSymbolType.ZBAR_EAN5 }],
  ],
  [
    "isbn_10",
    [{ sym: ZBarSymbolType.ZBAR_ISBN10 }, { sym: ZBarSymbolType.ZBAR_EAN13 }],
  ],
  [
    "isbn_13",
    [{ sym: ZBarSymbolType.ZBAR_ISBN13 }, { sym: ZBarSymbolType.ZBAR_EAN13 }],
  ],
  [
    "isbn_13+2",
    [
      { sym: ZBarSymbolType.ZBAR_ISBN13 },
      { sym: ZBarSymbolType.ZBAR_EAN13 },
      { sym: ZBarSymbolType.ZBAR_EAN2 },
    ],
  ],
  [
    "isbn_13+5",
    [
      { sym: ZBarSymbolType.ZBAR_ISBN13 },
      { sym: ZBarSymbolType.ZBAR_EAN13 },
      { sym: ZBarSymbolType.ZBAR_EAN5 },
    ],
  ],
  ["itf", [{ sym: ZBarSymbolType.ZBAR_I25 }]],
  ["qr_code", [{ sym: ZBarSymbolType.ZBAR_QRCODE }]],
  ["sq_code", [{ sym: ZBarSymbolType.ZBAR_SQCODE }]],
  [
    "upc_a",
    [{ sym: ZBarSymbolType.ZBAR_UPCA }, { sym: ZBarSymbolType.ZBAR_EAN13 }],
  ],
  [
    "upc_e",
    [{ sym: ZBarSymbolType.ZBAR_UPCE }, { sym: ZBarSymbolType.ZBAR_EAN13 }],
  ],
]);

function configZBarScanner(scanner: ZBarScanner, format: ZBarBarcodeFormat) {
  for (const { sym, conf, value } of formatMap.get(format) ?? []) {
    scanner.setConfig(sym, conf ?? ZBarConfigType.ZBAR_CFG_ENABLE, value ?? 1);
  }
}

function getFormatFromSymbolType(type: ZBarSymbolType): ZBarBarcodeFormat {
  for (const [format, [{ sym }]] of formatMap) {
    if (sym === type) {
      return format;
    }
  }
  throw new Error(`Unsupported ZBar symbol type: ${type}`);
}

export class ZBarBarcodeDetector extends BarcodeDetectorClassGenerator<ZBarBarcodeFormat>() {
  #formats: readonly ZBarBarcodeFormat[];
  #enableCache: ZBarBarcodeDetectorOptions["enableCache"];
  #encoding: ZBarBarcodeDetectorOptions["encoding"];
  #scannerPromise: Promise<ZBarScanner>;
  constructor(
    zBarBarcodeDetectorOptions: ZBarBarcodeDetectorOptions = {
      formats: zBarBarcodeFormatList,
      encoding: "utf8",
    }
  ) {
    super();
    this.#formats = zBarBarcodeDetectorOptions.formats;
    this.#enableCache = zBarBarcodeDetectorOptions.enableCache;
    this.#encoding = zBarBarcodeDetectorOptions.encoding;
    this.#scannerPromise = ZBarScanner.create().then((scanner) => {
      scanner.setConfig(
        ZBarSymbolType.ZBAR_NONE,
        ZBarConfigType.ZBAR_CFG_ENABLE,
        0
      );
      this.#formats.forEach((format) => {
        configZBarScanner(scanner, format);
      });
      scanner.enableCache(this.#enableCache);
      return scanner;
    });
  }
  static async getSupportedFormats() {
    return zBarBarcodeFormatList;
  }
  async detect(
    image: ImageBitmapSourceWebCodecs
  ): Promise<ZBarDetectedBarcode[]> {
    const imageData = await getImageDataFromImageBitmapSource(image);
    if (imageData.width === 0 || imageData.height === 0) {
      return [];
    }
    const scanner = await this.#scannerPromise;
    const symbols = await scanRGBABuffer(
      imageData.data,
      imageData.width,
      imageData.height,
      scanner
    );
    const zBarDetectedBarcodeList = symbols.map(
      this.#zBarSymbolToZBarDetectedBarcode
    );
    return zBarDetectedBarcodeList;
  }
  #zBarSymbolToZBarDetectedBarcode(symbol: ZBarSymbol): ZBarDetectedBarcode {
    const [minX, maxX, minY, maxY] = symbol.points.reduce(
      ([minX, maxX, minY, maxY], { x, y }) => [
        Math.min(minX, x),
        Math.max(maxX, x),
        Math.min(minY, y),
        Math.max(maxY, y),
      ],
      [Infinity, -Infinity, Infinity, -Infinity]
    );
    const zBarDetectedBarcode: ZBarDetectedBarcode = {
      format: getFormatFromSymbolType(symbol.type),
      rawValue: symbol.decode(this.#encoding),
      orientation: symbol.orientation,
      quality: symbol.quality,
      boundingBox: DOMRectReadOnly.fromRect({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      }),
      cornerPoints: [
        {
          x: minX,
          y: minY,
        },
        {
          x: maxX,
          y: minY,
        },
        {
          x: maxX,
          y: maxY,
        },
        {
          x: minX,
          y: maxY,
        },
      ],
    };
    return zBarDetectedBarcode;
  }
}
