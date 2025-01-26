import { DEFAULT_IMAGE_URL } from "../consts";
import { drawImageToCanvas } from "./drawImageToCanvas";
import { getHtmlImage } from "./getHtmlImage";

export async function getIframeCanvas(src = DEFAULT_IMAGE_URL) {
  const img = await getHtmlImage(src, true);
  return await new Promise<HTMLCanvasElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeCanvas = iframe.contentDocument!.querySelector("canvas")!;
      drawImageToCanvas(img, iframeCanvas);
      resolve(iframeCanvas);
      setTimeout(() => {
        iframe.remove();
      }, 100);
    });
    iframe.srcdoc = `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <canvas></canvas>
  </body>
</html>`;
    document.body.appendChild(iframe);
  });
}
