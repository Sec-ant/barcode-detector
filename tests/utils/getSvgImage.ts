import { DEFAULT_IMAGE_URL } from "../consts";
import { getHtmlImage } from "./getHtmlImage";

export async function getSvgImage(src = DEFAULT_IMAGE_URL, decode = false) {
  let width: number | undefined;
  let height: number | undefined;
  try {
    const htmlImage = await getHtmlImage(src, true);
    width = htmlImage.width;
    height = htmlImage.height;
  } catch {}
  return await new Promise<SVGImageElement>((resolve) => {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    if (width) {
      image.setAttribute("width", `${width}`);
    }
    if (height) {
      image.setAttribute("height", `${height}`);
    }
    image.addEventListener("load", async () => {
      resolve(image);
    });
    image.addEventListener("error", () => {
      resolve(image);
    });
    image.href.baseVal = src;
    if (!decode) {
      resolve(image);
    }
  });
}
