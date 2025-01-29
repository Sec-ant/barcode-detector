import { DEFAULT_IMAGE_URL } from "../consts";

export async function getIframeHtmlImage(src = DEFAULT_IMAGE_URL) {
  return await new Promise<HTMLImageElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", async () => {
      resolve(iframe.contentDocument!.querySelector("img")!);
      setTimeout(() => {
        iframe.remove();
      }, 100);
    });
    iframe.srcdoc = `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <img src="${src}">
  </body>
</html>`;
    document.body.appendChild(iframe);
  });
}
