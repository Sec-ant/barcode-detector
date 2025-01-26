import { DEFAULT_IMAGE_URL } from "../consts";
import { getOffscreenCanvas } from "./getOffscreenCanvas";

export async function getImageData(src = DEFAULT_IMAGE_URL) {
  const canvas = await getOffscreenCanvas(src);
  const context = canvas.getContext("2d")!;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return imageData;
}
