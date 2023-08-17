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

or rename the export to prevent possible namespace collisions:

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

## `setZXingModuleOverrides`

Apart from `BarcodeDetector`, there's also an exported function called `setZXingModuleOverrides`. This package uses [Sec-ant/zxing-wasm](https://github.com/Sec-ant/zxing-wasm) to provide the core function of reading barcodes. So there will be a `.wasm` binary file to load. By default, the path of the `.wasm` binary file is:

```
https://cdn.jsdelivr.net/npm/@sec-ant/zxing-wasm@{version}/dist/reader/zxing_reader.wasm
```

`setZXingModuleOverrides` is useful when you want to take control of the location where the `.wasm` binary file will be served, so you can use this package in a local network or you want to choose another CDN. You have to use this function prior to `new BarcodeDetector()` for it to take effect. For more information on how to use it, please check [the notes here](https://github.com/Sec-ant/zxing-wasm#notes).

This function is also exported from the [side effects](#side-effects) subpath.

```ts
import { setZXingModuleOverrides } from "@sec-ant/barcode-detector/side-effects";
```

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

## License

The source code in this repository, as well as the build output, except for the parts listed below, is licensed under the [MIT license](./LICENSE).

Test samples and resources are collected from [zxing-cpp/zxing-cpp](https://github.com/zxing-cpp/zxing-cpp), which is licensed under the [Apache-2.0 license](https://raw.githubusercontent.com/zxing-cpp/zxing-cpp/master/LICENSE), and [web-platform-tests/wpt](https://github.com/web-platform-tests/wpt), which is licensed under the [3-Clause BSD license](https://raw.githubusercontent.com/web-platform-tests/wpt/master/LICENSE.md).

This package has an indirect dependency on [Sec-ant/zxing-wasm-build](https://github.com/Sec-ant/zxing-wasm-build), which is licensed under the [Apache-2.0 license](https://raw.githubusercontent.com/Sec-ant/zxing-wasm-build/main/LICENSE).
