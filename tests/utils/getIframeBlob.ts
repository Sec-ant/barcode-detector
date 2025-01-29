import { DEFAULT_IMAGE_URL } from "../consts";

export async function getIframeBlob(src = DEFAULT_IMAGE_URL) {
  return await new Promise<Blob>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", async () => {
      const resp = await iframe.contentDocument!.defaultView!.fetch(src);
      const blob = await resp.blob();
      resolve(blob);
      setTimeout(() => {
        iframe.remove();
      }, 100);
    });
    document.body.appendChild(iframe);
  });
}
