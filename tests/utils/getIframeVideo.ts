import { DEFAULT_VIDEO_URL } from "../consts";
import { seekTo } from "./seekTo";

interface GetIframeVideoOptions {
  seekTime?: number;
  readyState?: "nothing" | "metadata" | "data";
}

export async function getIframeVideo(
  src = DEFAULT_VIDEO_URL,
  { seekTime = 0, readyState = "data" }: GetIframeVideoOptions = {},
) {
  return await new Promise<HTMLVideoElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeVideo = iframe.contentDocument!.querySelector("video")!;
      if (readyState === "metadata") {
        iframeVideo.addEventListener(
          "loadedmetadata",
          () => {
            resolve(iframeVideo);
          },
          { once: true },
        );
      }
      iframeVideo.addEventListener(
        "loadeddata",
        async () => {
          await seekTo(iframeVideo, seekTime);
          resolve(iframeVideo);
        },
        { once: true },
      );
      iframeVideo.addEventListener("error", () => {
        resolve(iframeVideo);
      });
      iframeVideo.load();
      if (readyState === "nothing") {
        resolve(iframeVideo);
      }
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
