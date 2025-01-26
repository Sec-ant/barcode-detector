import { DEFAULT_VIDEO_URL } from "../consts";
import { seekTo } from "./seekTo";

export async function getIframeVideo(src = DEFAULT_VIDEO_URL) {
  return await new Promise<HTMLVideoElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeVideo = iframe.contentDocument!.querySelector("video")!;
      iframeVideo.addEventListener(
        "loadeddata",
        async () => {
          await seekTo(iframeVideo, 0);
          resolve(iframeVideo);
        },
        { once: true },
      );
      iframeVideo.addEventListener("error", () => {
        resolve(iframeVideo);
      });
      iframeVideo.load();
    });
    iframe.srcdoc = `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <video src="${src}" loop muted>
  </body>
</html>`;
    document.body.appendChild(iframe);
  });
}
