import { DEFAULT_IMAGE_URL } from "../consts";

export async function getHtmlImage(src = DEFAULT_IMAGE_URL, decode = false) {
  return await new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.addEventListener("error", () => {
      resolve(image);
    });
    image.src = src;
    if (!decode) {
      resolve(image);
    }
  });
}
