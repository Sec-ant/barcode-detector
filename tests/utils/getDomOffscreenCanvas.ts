import { DEFAULT_IMAGE_URL } from "../consts";
import { drawImageToCanvas } from "./drawImageToCanvas";
import { getHtmlImage } from "./getHtmlImage";

export async function getDomOffscreenCanvas(src = DEFAULT_IMAGE_URL) {
  const image = await getHtmlImage(src, true);
  const offscreenCanvas = new OffscreenCanvas(image.width, image.height);
  return drawImageToCanvas(image, offscreenCanvas);
}
