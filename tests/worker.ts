import { BarcodeDetector } from "../src/ponyfill";
import { getBlob } from "./utils/getBlob";
import { getImageBitmap } from "./utils/getImageBitmap";
import { getImageData } from "./utils/getImageData";
import { getOffscreenCanvas } from "./utils/getOffscreenCanvas";
import { getVideoFrame } from "./utils/getVideoFrame";
import type { MessageRequestData } from "./utils/messageData";

self.onmessage = async ({
  data: { imageType, url, fingerPrint },
}: MessageEvent<MessageRequestData>) => {
  try {
    const barcodeDetector = new BarcodeDetector();
    switch (imageType) {
      case "blob": {
        const blob = await getBlob(url);
        const detectedBarcodes = await barcodeDetector.detect(blob);
        self.postMessage({ detectedBarcodes, fingerPrint });
        return;
      }
      case "imageBitmap": {
        const imageBitmap = await getImageBitmap(url);
        const detectedBarcodes = await barcodeDetector.detect(imageBitmap);
        self.postMessage({ detectedBarcodes, fingerPrint });
        return;
      }
      case "offscreenCanvas": {
        const offscreenCanvas = await getOffscreenCanvas(url);
        const detectedBarcodes = await barcodeDetector.detect(offscreenCanvas);
        self.postMessage({ detectedBarcodes, fingerPrint });
        return;
      }
      case "imageData": {
        const imageData = await getImageData(url);
        const detectedBarcodes = await barcodeDetector.detect(imageData);
        self.postMessage({ detectedBarcodes, fingerPrint });
        return;
      }
      case "videoFrame": {
        const videoFrame = await getVideoFrame(url);
        const detectedBarcodes = await barcodeDetector.detect(videoFrame);
        self.postMessage({ detectedBarcodes, fingerPrint });
        return;
      }
      default: {
        ((_: never) => {})(imageType);
      }
    }
  } catch (error) {
    self.postMessage({ error, fingerPrint });
  }
};
