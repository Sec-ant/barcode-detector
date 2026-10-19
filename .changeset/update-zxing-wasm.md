---
"barcode-detector": patch
---

Improve barcode detection performance by upgrading `zxing-wasm` to 3.1.6. Detection latency decreased by approximately 40–48% in the benchmarked 720p/1080p scenarios on Chromium 156 (Apple M3 Pro).
