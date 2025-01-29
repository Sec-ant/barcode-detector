import { DEFAULT_IMAGE_URL } from "../consts";

export async function getIframeSvgImage(src = DEFAULT_IMAGE_URL) {
  return await new Promise<SVGImageElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", async () => {
      resolve(iframe.contentDocument!.querySelector("image")!);
      setTimeout(() => {
        iframe.remove();
      }, 100);
    });
    iframe.srcdoc = `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <image href="${src}" width="1000" height="1000"></image>
    </svg>
  </body>
</html>`;
    document.body.appendChild(iframe);
  });
}
