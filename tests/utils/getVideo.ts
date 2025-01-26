import { DEFAULT_VIDEO_URL } from "../consts";
import { seekTo } from "./seekTo";

export async function getVideo(src = DEFAULT_VIDEO_URL) {
  return await new Promise<HTMLVideoElement>((resolve) => {
    const video = document.createElement("video");
    video.addEventListener(
      "loadeddata",
      async () => {
        await seekTo(video, 0);
        resolve(video);
      },
      { once: true },
    );
    video.addEventListener(
      "error",
      async () => {
        resolve(video);
      },
      { once: true },
    );
    video.src = src;
    video.loop = true;
    video.muted = true;
    video.load();
  });
}
