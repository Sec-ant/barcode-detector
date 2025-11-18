# barcode-detector

## 3.0.8

### Patch Changes

- 1157548: Bump zxing-wasm to v2.2.4 and remove any usage of `Array.prototype.entries`

## 3.0.7

### Patch Changes

- 5fa1ce1: Bump zxing-wasm to v2.2.3. No more unhandled errors but only service unavailable DOM exception will be thrown when the WASM initialization fails.

## 3.0.6

### Patch Changes

- 4037bd8: Bump deps and switch to OIDC trusted publishing

## 3.0.5

### Patch Changes

- 24ffa0f: Bump zxing-wasm to v2.2.0 with some bug fixes.

## 3.0.4

### Patch Changes

- 6ad20b6: The version of `zxing-wasm` should be pinned.

## 3.0.3

### Patch Changes

- c679c9a: Bump `zxing-wasm` to `v2.1.2` to fix unexpected `new URL(..., import.meta.url)` expansion when bundling this package on the consumer side, which fixes #176, and also updated several deps.

## 3.0.2

### Patch Changes

- e3e97da: Bump zxing-wasm to v2.1.1 along with other deps. Re-enable firefox tests. Add a simple dev page.

## 3.0.1

### Patch Changes

- 8206888: Bump zxing-wasm to v2.1.0 and other deps.

## 3.0.0

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

## 2.3.1

### Patch Changes

- 1698524: Bump zxing-wasm to v1.3.4 to fix PDF417 position info

## 2.3.0

### Minor Changes

- b9910bb: Add `databar_limited` detection support

## 2.2.12

### Patch Changes

- 139c454: Remove `zxing`-related tests as they are moved into the `zxing-wasm` repo.
- 139c454: Pin `@types/dom-webcodecs` to `0.1.11` to avoid breaking types in projects using a lower version of TypeScript. Fixes #120.
- 139c454: Bump `zxing-wasm` to `1.2.15`. The success rate should be improved a lot.

## 2.2.11

### Patch Changes

- 1d27f3e: Fix image bitmap source type detection across iframes.

## 2.2.10

### Patch Changes

- 38e0b9f: Bump zxing-wasm to 1.2.14 to mitigate DOM Clobbering vulnerability.

## 2.2.9

### Patch Changes

- b0bfea1: Fix detecting HTML elements from iframes. See [#110](https://github.com/Sec-ant/barcode-detector/issues/110).

## 2.2.8

### Patch Changes

- 519cfe2: Preserve codabar start and end control chars. Fixes [#91](https://github.com/Sec-ant/barcode-detector/issues/91).
- 70c58e1: Bump `zxing-wasm` and switch to `pnpm` and `renovate`

## 2.2.7

### Patch Changes

- 1da2c2b: Bump zxing-wasm to v1.2.11 and other dependencies

## 2.2.6

### Patch Changes

- 4af1507: Bump `zxing-wasm` to v1.2.10

## 2.2.5

### Patch Changes

- a7a46ee: Bump zxing-wasm to v1.2.7

## 2.2.4

### Patch Changes

- 48ab8ac: Bump `zxing-wasm` to `v1.2.4`.

## 2.2.3

### Patch Changes

- 529ec4e: bump zxing-wasm to v1.2.3
