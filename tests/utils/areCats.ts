import { assert } from "vitest";
import type { DetectedBarcode } from "../../src/ponyfill";

export function areCats(detectionResult: DetectedBarcode[]) {
  assert.equal(detectionResult.length, 1);
  assert.equal(detectionResult[0]?.rawValue, "cats");
  assert.equal(detectionResult[0]?.format, "qr_code");
}
