# barcode-detector

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
