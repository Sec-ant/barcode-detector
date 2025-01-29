---
"barcode-detector": major
---

Generally, this release bumped the [`zxing-wasm`](https://github.com/Sec-ant/zxing-wasm) dependency to [`v2`](https://github.com/Sec-ant/zxing-wasm/releases/tag/v2.0.1) and renamed the subpath exports to `ponyfill` and `polyfill` from `pure` and `side-effects`. Detailed changes are as follows:

### Breaking Changes

#### Renamed subpath exports

To avoid possible misunderstandings (we also use the term [`pure`](https://zxing-wasm.deno.dev/interfaces/full.ReaderOptions.html#ispure) in `zxing-wasm`), the `pure` and `side-effects` subpath exports were renamed to `ponyfill` and `polyfill`, respectively. The old subpath exports are considered deprecated and are no longer recommended for use.

#### No longer a subclass of `EventTarget`

The `BarcodeDetector` class is no longer a subclass of `EventTarget`. `BarcodeDetector` wasn't designed to be an event target per the spec. This design was previously to allow for customized event handling. However, it causes more [issues](https://github.com/Sec-ant/barcode-detector/issues/90) than it solves.

#### EAN-2/5 add-on symbols ignored

The EAN-2/5 add-on symbols were previously read if found. However, to align with the behavior of the native barcode detectors in Chromium and Safari on macOS, they are now ignored in this new version.

#### `zxing-wasm` v2

The [`zxing-wasm`](https://github.com/Sec-ant/zxing-wasm) dependency was bumped to [`v2`](https://github.com/Sec-ant/zxing-wasm/releases/tag/v2.0.1). This release includes breaking changes itself. For example, `setZXingModuleOverrides` is replaced by `prepareZXingModule`. Please refer to [the README of `zxing-wasm`](https://github.com/Sec-ant/zxing-wasm?tab=readme-ov-file#configuring-wasm-serving) for detailed instructions on the new APIs.

### Bug Fixes

#### Zero-sized `Blob` image no longer throws error

Per [the spec](https://wicg.github.io/shape-detection-api/#image-sources-for-detection), zero-sized `ImageBitmapSource` shouldn't cause errors to be thrown. `Blob` is [one kind of the `ImageBitmapSource`](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#images-2) and therefore should also comply with this rule. This is now fixed.

#### Fix TS `moduleResolution: node` subpath exports resolution

The subpath export types are now compatible with TypeScript's `moduleResolution: node` strategy by using the [types-versions-wildcards strategy](https://github.com/andrewbranch/example-subpath-exports-ts-compat/tree/main/examples/node_modules/types-versions-wildcards). This package now passes all the [`arethetypeswrong` checks](https://arethetypeswrong.github.io/?p=barcode-detector%403.0.0).
