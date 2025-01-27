import { DEFAULT_VIDEO_URL } from "../consts";
import { seekTo } from "./seekTo";

interface GetVideoOptions {
  seekTime?: number;
  readyState?: "nothing" | "metadata" | "data";
}

export async function getVideo(
  src = DEFAULT_VIDEO_URL,
  { seekTime = 0, readyState = "data" }: GetVideoOptions = {},
) {
  return await new Promise<HTMLVideoElement>((resolve) => {
    const video = document.createElement("video");
    if (readyState === "metadata") {
      video.addEventListener(
        "loadedmetadata",
        () => {
          resolve(video);
        },
        { once: true },
      );
    }
    video.addEventListener(
      "loadeddata",
      async () => {
        await seekTo(video, seekTime);
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
    if (readyState === "nothing") {
      resolve(video);
    }
  });
}
