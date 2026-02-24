---
"barcode-detector": minor
---

#### Bump `zxing-wasm` to v3 with finer-grained barcode format detection

This release upgrades the underlying [`zxing-wasm`](https://github.com/Sec-ant/zxing-wasm) dependency from v2 to v3, which brings more precise barcode format identification. The decoder now distinguishes sub-variants within certain symbology families, so the `format` field in detection results may return more specific values than before.

#### Detection result `format` changes

Previously, the decoder reported the base symbology name for all variants within a family. With this release, detection results use the specific sub-variant format for the following symbologies:

| Previously returned  | Now returns (depending on the actual barcode)              |
| :------------------- | :--------------------------------------------------------- |
| `"databar"`          | `"databar_omni"` or `"databar_stacked"`                    |
| `"databar_expanded"` | `"databar_expanded"` or `"databar_expanded_stacked"`       |
| `"code_39"`          | `"code_39"`, `"code_39_extended"`, `"code_32"`, or `"pzn"` |

> **Note:** If your code matches on exact `format` values (e.g., `result.format === "databar"`), you may need to update it to account for the new sub-variant names. The original base format names (`"databar"`, `"code_39"`, etc.) are still valid as **input** hints in the `formats` option of the `BarcodeDetector` constructor, but `"databar"` will no longer appear in detection **output**. `"databar_expanded"` and `"code_39"` can still appear in output when the detected barcode is the base variant.

#### New supported formats

The following format names are now accepted in `BarcodeDetectorOptions.formats` and may appear in detection results:

- `"code_39_extended"`, `"code_32"`, `"pzn"` — Code 39 sub-variants
- `"databar_omni"`, `"databar_stacked"`, `"databar_expanded_stacked"` — DataBar sub-variants

The following format names are now accepted in `BarcodeDetectorOptions.formats` as **input** hints (they do not currently appear in detection output, but requesting them may filter detection to the appropriate symbology family):

- `"aztec_code"`, `"aztec_rune"` — Aztec sub-variants
- `"code_39_standard"` — Code 39 standard variant
- `"databar_stacked_omni"` — DataBar Stacked Omni variant
- `"ean_upc"`, `"isbn"` — EAN/UPC family
- `"itf_14"` — ITF sub-variant
- `"compact_pdf417"` — PDF417 sub-variant
- `"qr_code_model_1"`, `"qr_code_model_2"` — QR Code sub-variants
- `"other_barcode"` — catch-all for unclassified formats

#### New shorthand formats

Three new shorthand (meta) formats can be used in the `formats` option:

- `"gs1_codes"` — all GS1-compatible barcode formats
- `"retail_codes"` — all retail barcode formats (EAN, UPC, DataBar, etc.)
- `"industrial_codes"` — all industrial barcode formats (Code 39, Code 128, ITF, etc.)
