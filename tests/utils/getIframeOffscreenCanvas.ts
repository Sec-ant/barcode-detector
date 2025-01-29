import { DEFAULT_IMAGE_URL } from "../consts";
import { drawImageToCanvas } from "./drawImageToCanvas";
import { getHtmlImage } from "./getHtmlImage";

export async function getIframeOffscreenCanvas(src = DEFAULT_IMAGE_URL) {
  const image = await getHtmlImage(src, true);
  return await new Promise<OffscreenCanvas>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const offscreenCanvas = new iframe.contentDocument!
        .defaultView!.OffscreenCanvas(image.width, image.height);
      resolve(drawImageToCanvas(image, offscreenCanvas));
      setTimeout(() => {
        iframe.remove();
      }, 100);
    });
    document.body.appendChild(iframe);
  });
}
