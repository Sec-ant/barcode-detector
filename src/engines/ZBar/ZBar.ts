import {
  ZBarConfigType,
  ZBarSymbolType,
  ZBarScanner,
} from "@undecaf/zbar-wasm";
import { DetectedBarcode } from "../../BarcodeDetectorX.js";

export interface EngineRegistry {
  ZBar: string;
}

export type ZBarBarcodeFormat =
  | "codabar"
  | "code_39"
  | "code_93"
  | "code_128"
  | "databar"
  | "databar_exp"
  | "ean_2"
  | "ean_5"
  | "ean_8"
  | "ean_13"
  | "ean_13+2"
  | "ean_13+5"
  | "isbn_10"
  | "isbn_13"
  | "isbn_13+2"
  | "isbn_13+5"
  | "itf"
  | "qr_code"
  | "sq_code"
  | "upc_a"
  | "upc_e";

export enum Orientation {
  UNKNOWN = -1,
  UPRIGHT,
  ROTATED_RIGHT,
  UPSIDE_DOWN,
  ROTATED_LEFT,
}

/**
 * Additional {@link BarcodeDetectorPolyfill} options supported by
 * the underlying ZBar implementation.
 */
export interface ZBarConfig {
  // Overrides automatic cache management if specified
  enableCache?: boolean;

  /**
   * Any of https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings;
   * defaults to UTF-8
   */
  encoding?: string;
}

export interface ZBarDetectedBarcode extends DetectedBarcode {
  // @undecaf/zbar-wasm extensions
  orientation: Orientation;
  quality: number;
}

export function configZBarScanner(
  scanner: ZBarScanner,
  format: ZBarBarcodeFormat
) {
  for (const { sym, conf, value } of formatMap.get(format) ?? []) {
    scanner.setConfig(sym, conf ?? ZBarConfigType.ZBAR_CFG_ENABLE, value ?? 1);
  }
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
