import { DEFAULT_IMAGE_URL } from "../consts";
import { getImageBitmap } from "./getImageBitmap";

export async function getIframeVideoFrame(src = DEFAULT_IMAGE_URL) {
  const imageBitmap = await getImageBitmap(src);
  return await new Promise<VideoFrame>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      resolve(
        new iframe.contentDocument!.defaultView!.VideoFrame(imageBitmap, {
          timestamp: 0,
        }),
      );
      setTimeout(() => {
        iframe.remove();
      }, 100);
    });
    document.body.appendChild(iframe);
  });
}
