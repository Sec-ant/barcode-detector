import { assert } from "vitest";
import type { DetectedBarcode } from "../../src/ponyfill";

export function areCatsAndDogs(detectionResult: DetectedBarcode[]) {
  assert.equal(detectionResult.length, 2);
  assert.equal(detectionResult[0]?.rawValue, "cats");
  assert.equal(detectionResult[0]?.format, "qr_code");
  assert.equal(detectionResult[1]?.rawValue, "dogs");
  assert.equal(detectionResult[1]?.format, "code_128");
}
