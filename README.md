# @sec-ant/barcode-detector

A [Barcode Detection API](https://wicg.github.io/shape-detection-api/#barcode-detection-api) polyfill that uses [ZXing webassembly](https://github.com/Sec-ant/zxing-wasm) internally.

## Install

```bash
npm i @sec-ant/barcode-detector
```

## Usage

```ts
// import as side effects
import "@sec-ant/barcode-detector";
// or import explicitly
// import { BarcodeDetector } from "@sec-ant/barcode-detector";

const barcodeDetector: BarcodeDetector = new BarcodeDetector({
  formats: ["qr_code"],
});

const imageFile = await fetch(
  "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Hello%20world!"
).then((resp) => resp.blob());

const imageData = await createImageBitmap(imageFile).then((imageBitmap) => {
  const { width, height } = imageBitmap;
  const context = new OffscreenCanvas(width, height).getContext(
    "2d"
  ) as OffscreenCanvasRenderingContext2D;
  context.drawImage(imageBitmap, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
});

barcodeDetector.detect(imageData).then(console.log);
```
