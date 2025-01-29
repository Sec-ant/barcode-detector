import { DEFAULT_IMAGE_URL } from "../consts";
import { getImageBitmap } from "./getImageBitmap";

export async function getOffscreenCanvas(src = DEFAULT_IMAGE_URL) {
  const imageBitmap = await getImageBitmap(src);
  const offscreenCanvas = new OffscreenCanvas(
    imageBitmap.width,
    imageBitmap.height,
  );
  const context = offscreenCanvas.getContext("2d")!;
  context.drawImage(imageBitmap, 0, 0);
  return offscreenCanvas;
}
