# barcode-detector

[![npm](https://img.shields.io/npm/v/barcode-detector)](https://www.npmjs.com/package/barcode-detector/v/latest) [![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/barcode-detector)](https://www.npmjs.com/package/barcode-detector/v/latest) [![jsDelivr hits (npm scoped)](https://img.shields.io/jsdelivr/npm/hm/barcode-detector?color=%23ff5627)](https://cdn.jsdelivr.net/npm/barcode-detector@latest/)

A [Barcode Detection API](https://wicg.github.io/shape-detection-api/#barcode-detection-api) polyfill that uses [ZXing-C++ WebAssembly](https://github.com/Sec-ant/zxing-wasm) under the hood.

Supported barcode formats: `aztec`, `code_128`, `code_39`, `code_93`, `codabar`, `databar`, `databar_expanded`, `data_matrix`, `dx_film_edge`, `ean_13`, `ean_8`, `itf`, `maxi_code` (only generated ones, and no position info), `micro_qr_code`, `pdf417`, `qr_code`, `rm_qr_code`, `upc_a`, `upc_e`, `linear_codes` and `matrix_codes` (for convenience).

## Install

To install, run the following command:

```bash
npm i barcode-detector
```

## Recommended Usage with Node + ESM

This package can be imported in three different ways:

### Pure Module

```ts
import { BarcodeDetector } from "barcode-detector/pure";
```

To avoid potential namespace collisions, you can also rename the export:

```ts
import { BarcodeDetector as BarcodeDetectorPolyfill } from "barcode-detector/pure";
```

This approach is beneficial when you want to use a package to detect barcodes without polluting `globalThis`, or when your runtime already provides an implementation of the Barcode Detection API, but you still want this package to function.

### Side Effects

```ts
import "barcode-detector/side-effects";
```

This approach is beneficial when you need a drop-in polyfill. If there's already an implementation of Barcode Detection API on `globalThis`, this won't take effect (type declarations will, as we cannot optionally declare types). In such cases, please use the [pure module](#pure-module) instead.

### Both

```ts
import { BarcodeDetector } from "barcode-detector";
```

This approach combines the [pure module](#pure-module) and [side effects](#side-effects).

## Recommended Usage in Modern Browsers

For [modern browsers that support ES modules](https://caniuse.com/es6-module), this package can be imported via the `<script type="module">` tags:

1. Include side effects:

   ```html
   <!-- register -->
   <script
     type="module"
     src="https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/es/side-effects.min.js"
   ></script>

   <!-- use -->
   <script type="module">
     const barcodeDetector = new BarcodeDetector();
   </script>
   ```

2. Script scoped access:

   ```html
   <script type="module">
     import { BarcodeDetector } from "https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/es/pure.min.js";
     const barcodeDetector = new BarcodeDetector();
   </script>
   ```

3. With import maps:

   ```html
   <!-- import map -->
   <script type="importmap">
     {
       "imports": {
         "barcode-detector/pure": "https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/es/pure.min.js"
       }
     }
   </script>

   <!-- script scoped access -->
   <script type="module">
     import { BarcodeDetector } from "barcode-detector/pure";
     const barcodeDetector = new BarcodeDetector();
   </script>
   ```

## Usage with Legacy Compatibility

Starting from v1.2, this package supports IIFE and CJS build outputs for use cases that require legacy compatibility.

### IIFE

For legacy browsers that lack support for module type `<script>` tags, or for userscripts, IIFE is the preferred choice. Upon executing the IIFE script, a variable named `BarcodeDetectionAPI` will be registered in the global.

```html
<!-- 
  IIFE pure.js registers:
  window.BarcodeDetectionAPI.BarcodeDetector
  window.BarcodeDetectionAPI.setZXingModuleOverrides
  -->
<script src="https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/iife/pure.min.js"></script>

<!-- 
  IIFE side-effects.js registers:
  window.BarcodeDetector
  window.BarcodeDetectionAPI.setZXingModuleOverrides
  -->
<script src="https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/iife/side-effects.min.js"></script>

<!-- 
  IIFE index.js registers:
  window.BarcodeDetector
  window.BarcodeDetectionAPI.BarcodeDetector
  window.BarcodeDetectionAPI.setZXingModuleOverrides
  -->
<script src="https://fastly.jsdelivr.net/npm/barcode-detector@2/dist/iife/index.min.js"></script>
```

### CJS

This package can also be consumed as a commonjs package:

1. Vanilla Javascript:

   ```js
   // src/index.js
   const { BarcodeDetector } = require("barcode-detector/pure");
   ```

2. With Typescript:

   ```ts
   // src/index.ts
   import { BarcodeDetector } from "barcode-detector/pure";
   ```

   `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "module": "CommonJS",
       "moduleResolution": "Node",
       "skipLibCheck": true
     },
     "include": ["src"]
   }
   ```

## `setZXingModuleOverrides`

In addition to `BarcodeDetector`, this package exports another function called `setZXingModuleOverrides`.

This package employs [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) to enable the core barcode reading functionality. As a result, a `.wasm` binary file is fetched at runtime. The default fetch path for this binary file is:

```
https://fastly.jsdelivr.net/npm/zxing-wasm@<version>/dist/reader/zxing_reader.wasm
```

The `setZXingModuleOverrides` function allows you to govern where the `.wasm` binary is served from, thereby enabling offline use of the package, use within a local network, or within a site having strict [CSP](https://developer.mozilla.org/docs/Web/HTTP/CSP) rules.

For instance, should you want to inline this `.wasm` file in your build output for offline usage, with the assistance of build tools, you could try:

```ts
// src/index.ts
import wasmFile from "../node_modules/zxing-wasm/dist/reader/zxing_reader.wasm?url";

import {
  setZXingModuleOverrides,
  BarcodeDetector,
} from "barcode-detector/pure";

setZXingModuleOverrides({
  locateFile: (path, prefix) => {
    if (path.endsWith(".wasm")) {
      return wasmFile;
    }
    return prefix + path;
  },
});

const barcodeDetector = new BarcodeDetector();

// detect barcodes
// ...
```

Alternatively, the `.wasm` file could be copied to your dist folder to be served from your local server, without incorporating it into the output as an extensive base64 data URL.

It's noteworthy that you'll always want to choose the correct version of the `.wasm` file, so the APIs exported by it are exactly what the js code expects.

For more information on how to use this function, you can check [the notes here](https://github.com/Sec-ant/zxing-wasm#notes) and [discussions here](https://github.com/Sec-ant/barcode-detector/issues/18) and [here](https://github.com/gruhn/vue-qrcode-reader/issues/354).

This function is exported from all the subpaths, including the [side effects](#side-effects).

## API

Please check the [spec](https://wicg.github.io/shape-detection-api/#barcode-detection-api), [MDN doc](https://developer.mozilla.org/docs/Web/API/Barcode_Detection_API) and [Chromium implementation](https://github.com/chromium/chromium/tree/main/third_party/blink/renderer/modules/shapedetection) for more information.

## Lifecycle Events

The `BarcodeDetector` provided by this package also extends class `EventTarget` and provides 2 lifecycle events: `load` and `error`. You can use `addEventListener` and `removeEventListener` to register and remove callback hooks on these events.

### `load` Event

The `load` event, which is a `CustomEvent`, will be dispatched on the successful instantiation of ZXing wasm module. For advanced usage, the instantiated module is passed as the `detail` parameter.

```ts
import { BarcodeDetector } from "barcode-detector/pure";

const barcodeDetector = new BarcodeDetector();

barcodeDetector.addEventListener("load", ({ detail }) => {
  console.log(detail); // zxing wasm module
});
```

### `error` Event

The `error` event, which is a `CustomEvent`, will be dispatched if the instantiation of ZXing wasm module is failed. An error is passed as the `detail` parameter.

```ts
import { BarcodeDetector } from "barcode-detector/pure";

const barcodeDetector = new BarcodeDetector();

barcodeDetector.addEventListener("error", ({ detail }) => {
  console.log(detail); // an error
});
```

## Example

```ts
import { BarcodeDetector } from "barcode-detector/pure";

const barcodeDetector: BarcodeDetector = new BarcodeDetector({
  formats: ["qr_code"],
});

const imageFile = await fetch(
  "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Hello%20world!",
).then((resp) => resp.blob());

barcodeDetector.detect(imageFile).then(console.log);
```

## License

The source code in this repository, as well as the build output, except for the parts listed below, is licensed under the [MIT license](./LICENSE).

Test samples and resources are collected from [zxing-cpp/zxing-cpp](https://github.com/zxing-cpp/zxing-cpp), which is licensed under the [Apache-2.0 license](https://raw.githubusercontent.com/zxing-cpp/zxing-cpp/master/LICENSE), and [web-platform-tests/wpt](https://github.com/web-platform-tests/wpt), which is licensed under the [3-Clause BSD license](https://raw.githubusercontent.com/web-platform-tests/wpt/master/LICENSE.md).
