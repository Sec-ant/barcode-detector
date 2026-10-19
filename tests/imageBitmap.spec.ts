import { afterEach, expect, onTestFinished, test, vi } from "vitest";
import { getImageDataOrBlobFromImageBitmapSource } from "../src/utils.js";
import { getBlob } from "./utils/getBlob.js";

afterEach(() => vi.restoreAllMocks());

test.each([false, true])(
  "closes a Blob's bitmap when conversion fails: %s",
  async (fails) => {
    const blob = await getBlob();
    const bitmap = await createImageBitmap(blob);
    onTestFinished(() => bitmap.close());
    vi.spyOn(globalThis, "createImageBitmap").mockResolvedValueOnce(bitmap);
    if (fails) {
      vi.spyOn(
        OffscreenCanvasRenderingContext2D.prototype,
        "getImageData",
      ).mockImplementationOnce(() => {
        throw new Error("readback failed");
      });
    }
    const conversion = getImageDataOrBlobFromImageBitmapSource(blob);
    if (fails) {
      await expect(conversion).rejects.toMatchObject({ name: "SecurityError" });
    } else {
      expect(await conversion).toBeInstanceOf(ImageData);
    }
    expect(bitmap.width).toBe(0);
  },
);

test("keeps a caller's ImageBitmap open", async () => {
  const bitmap = await createImageBitmap(await getBlob());
  onTestFinished(() => bitmap.close());
  const { width, height } = bitmap;
  const data = await getImageDataOrBlobFromImageBitmapSource(bitmap);
  expect(data).toMatchObject({ width, height });
  expect(bitmap.width).toBe(width);
  expect(bitmap.height).toBe(height);
});
