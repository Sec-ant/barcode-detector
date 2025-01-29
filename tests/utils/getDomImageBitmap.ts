import { DEFAULT_IMAGE_URL } from "../consts";
import { getHtmlImage } from "./getHtmlImage";

export async function getDomImageBitmap(src = DEFAULT_IMAGE_URL) {
  const htmlImage = await getHtmlImage(src, true);
  const imageBitmap = await createImageBitmap(htmlImage);
  return imageBitmap;
}
