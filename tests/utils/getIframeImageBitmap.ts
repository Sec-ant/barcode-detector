import { DEFAULT_IMAGE_URL } from "../consts";
import { getHtmlImage } from "./getHtmlImage";

export async function getIframeImageBitmap(src = DEFAULT_IMAGE_URL) {
  const img = await getHtmlImage(src, true);
  return await new Promise<ImageBitmap>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", async () => {
      const imageBitmap =
        await iframe.contentDocument!.defaultView!.createImageBitmap(img);
      resolve(imageBitmap);
      setTimeout(() => {
        iframe.remove();
      }, 100);
    });
    document.body.appendChild(iframe);
  });
}
