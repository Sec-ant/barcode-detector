import { DEFAULT_IMAGE_URL } from "../consts";
import { getIframeCanvas } from "./getIframeCanvas";

export async function getIframeImageData(src = DEFAULT_IMAGE_URL) {
  const canvas = await getIframeCanvas(src);
  return canvas
    .getContext("2d")!
    .getImageData(0, 0, canvas.width, canvas.height);
}
