---
"barcode-detector": patch
---

Bump `zxing-wasm` to `v2.1.2` to fix unexpected `new URL(..., import.meta.url)` expansion when bundling this package on the consumer side, which fixes #176, and also updated several deps.
