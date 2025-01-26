import type { DetectedBarcode } from "../../src/ponyfill";

export type ImageType =
  | "blob"
  | "offscreenCanvas"
  | "imageBitmap"
  | "imageData"
  | "videoFrame";
export type FingerPrint = number | string;

export interface MessageRequestData {
  imageType: ImageType;
  url?: string;
  fingerPrint: FingerPrint;
}

export interface MessageResponseSuccessData {
  detectedBarcodes: DetectedBarcode[];
  fingerPrint: FingerPrint;
}

export interface MessageResponseErrorData {
  error: unknown;
  fingerPrint: FingerPrint;
}

export type MessageResponseData =
  | MessageResponseSuccessData
  | MessageResponseErrorData;
