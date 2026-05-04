---
"barcode-detector": patch
---

Bump `zxing-wasm` to 3.0.3 (upstream `zxing-cpp` detector improvements and crash fixes; some barcodes may shift `cornerPoints` by 1–2 px, `rawValue` unchanged). Refresh dev deps, upgrade pnpm to v11, and drop the unused `"types": ["emscripten"]` from `tsconfig.json`.
