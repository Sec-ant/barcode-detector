# @sec-ant/barcode-detector

A [Barcode Detection API](https://wicg.github.io/shape-detection-api/#barcode-detection-api) polyfill that uses [ZXing webassembly](https://github.com/Sec-ant/zxing-wasm) under the hood.

## Install

```bash
npm i @sec-ant/barcode-detector
```

## Usage

You can use this package in 3 ways:

### Pure Module

```ts
import { BarcodeDetector } from "@sec-ant/barcode-detector/pure";
```

Or rename the export to prevent possible namespace collisions:

```ts
import { BarcodeDetector as BarcodeDetectorPolyfill } from "@sec-ant/barcode-detector/pure";
```

This is useful when you don't want to pollute `globalThis`:

- You just want to use a package to detect barcodes.
- The runtime you're using has already provided an implementation of the Barcode Detection API but you still want this package to work.

### Side Effects

```ts
import "@sec-ant/barcode-detector/side-effects";
```

This is useful when you just need a drop-in polyfill.

If there's already an implementation of Barcode Detection API on `globalThis`, this won't take effect. Please instead use [pure module](#pure-module).

### Both

```ts
import { BarcodeDetector } from "@sec-ant/barcode-detector";
```

This is the combination of [pure module](#pure-module) and [side effects](#side-effects).

## API

Please check the [spec](https://wicg.github.io/shape-detection-api/#barcode-detection-api) and [MDN doc](https://developer.mozilla.org/docs/Web/API/Barcode_Detection_API) for more information.

## Example

```ts
import "@sec-ant/barcode-detector/side-effects";

const barcodeDetector: BarcodeDetector = new BarcodeDetector({
  formats: ["qr_code"],
});

const imageFile = await fetch(
  "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Hello%20world!"
).then((resp) => resp.blob());

barcodeDetector.detect(imageFile).then(console.log);
```
