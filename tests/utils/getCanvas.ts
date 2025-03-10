import { DEFAULT_IMAGE_URL } from "../consts";
import { drawImageToCanvas } from "./drawImageToCanvas";
import { getHtmlImage } from "./getHtmlImage";

export async function getCanvas(src = DEFAULT_IMAGE_URL) {
  const image = await getHtmlImage(src, true);
  const canvas = document.createElement("canvas");
  return drawImageToCanvas(image, canvas);
}
