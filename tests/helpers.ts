import { assert } from "vitest";
import type { DetectedBarcode } from "../src/ponyfill";

export async function getBlob(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return fetch(src).then((resp) => resp.blob());
}

export async function getIframeBlob(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<Blob>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeBlob = iframe
        .contentDocument!.defaultView!.fetch(src)
        .then((resp) => resp.blob());
      resolve(iframeBlob);
    });
    document.body.appendChild(iframe);
  });
}

export async function getHtmlImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.addEventListener("error", () => {
      resolve(image);
    });
    image.src = src;
  });
}

export async function getIframeHtmlImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<HTMLImageElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      resolve(iframe.contentDocument!.querySelector("img")!);
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

export async function getSvgImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<SVGImageElement>((resolve) => {
    const htmlImagePromise = getHtmlImage(src);
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    image.addEventListener("load", async () => {
      const htmlImage = await htmlImagePromise;
      image.setAttribute("width", `${htmlImage.width}`);
      image.setAttribute("height", `${htmlImage.height}`);
      resolve(image);
    });
    image.addEventListener("error", () => {
      resolve(image);
    });
    image.href.baseVal = src;
  });
}

export async function getIframeSvgImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<SVGImageElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      resolve(iframe.contentDocument!.querySelector("image")!);
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

export async function getCanvas(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const image = await getHtmlImage(src);
  const canvas = document.createElement("canvas");
  return drawImageToCanvas(image, canvas);
}

export async function getIframeCanvas(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const image = await getHtmlImage(src);
  return await new Promise<HTMLCanvasElement>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeCanvas = iframe.contentDocument!.querySelector("canvas")!;
      drawImageToCanvas(image, iframeCanvas);
      resolve(iframeCanvas);
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

export async function getOffscreenCanvas(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const image = await getHtmlImage(src);
  const offscreenCanvas = new OffscreenCanvas(image.width, image.height);
  return drawImageToCanvas(image, offscreenCanvas);
}

export async function getIframeOffscreenCanvas(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const image = await getHtmlImage(src);
  return await new Promise<OffscreenCanvas>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const offscreenCanvas = new iframe.contentDocument!
        .defaultView!.OffscreenCanvas(image.width, image.height);
      resolve(drawImageToCanvas(image, offscreenCanvas));
    });
    document.body.appendChild(iframe);
  });
}

export async function getVideo(
  src = new URL("./resources/cats-dogs.webm", import.meta.url).href,
) {
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

export async function getIframeVideo(
  src = new URL("./resources/cats-dogs.webm", import.meta.url).href,
) {
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

export async function getVideoFrame(
  src = new URL("./resources/cats-dogs.webm", import.meta.url).href,
) {
  const video = await getVideo(src);
  return new VideoFrame(video, { timestamp: 0 });
}

export async function getIframeVideoFrame(
  src = new URL("./resources/cats-dogs.webm", import.meta.url).href,
) {
  const video = await getVideo(src);
  return await new Promise<VideoFrame>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      resolve(
        new iframe.contentDocument!.defaultView!.VideoFrame(video, {
          timestamp: 0,
        }),
      );
    });
    document.body.appendChild(iframe);
  });
}

export async function getImageBitmap(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await createImageBitmap(await getHtmlImage(src));
}

export async function getIframeImageBitmap(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const img = await getHtmlImage(src);
  return await new Promise<ImageBitmap>((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      resolve(iframe.contentDocument!.defaultView!.createImageBitmap(img));
    });
    document.body.appendChild(iframe);
  });
}

export async function getImageData(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const canvas = await getCanvas(src);
  return canvas
    .getContext("2d")!
    .getImageData(0, 0, canvas.width, canvas.height);
}

export async function getIframeImageData(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const canvas = await getIframeCanvas(src);
  return canvas
    .getContext("2d")!
    .getImageData(0, 0, canvas.width, canvas.height);
}

async function waitForNFrames(count: number) {
  if (count <= 0) {
    return Promise.reject(new TypeError("count should be greater than 0!"));
  }

  return await new Promise<void>((resolve) => {
    let c = count;
    function tick() {
      --c ? requestAnimationFrame(tick) : resolve();
    }
    requestAnimationFrame(tick);
  });
}

export async function seekTo(video: HTMLVideoElement, time: number) {
  return await new Promise<void>((resolve) => {
    video.addEventListener(
      "seeked",
      async () => {
        await waitForNFrames(3);
        resolve();
      },
      { once: true },
    );
    video.currentTime = time;
  });
}

export function drawImageToCanvas<
  T extends HTMLCanvasElement | OffscreenCanvas,
>(image: HTMLImageElement, canvas: T): T {
  canvas.width = image.width;
  canvas.height = image.height;
  (
    canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
  ).drawImage(image, 0, 0, image.width, image.height);
  return canvas;
}

export function areCats(detectionResult: DetectedBarcode[]) {
  assert.equal(detectionResult.length, 1);
  assert.equal(detectionResult[0]?.rawValue, "cats");
  assert.equal(detectionResult[0]?.format, "qr_code");
}

export function areCatsAndDogs(detectionResult: DetectedBarcode[]) {
  assert.equal(detectionResult.length, 2);
  assert.equal(detectionResult[0]?.rawValue, "cats");
  assert.equal(detectionResult[0]?.format, "qr_code");
  assert.equal(detectionResult[1]?.rawValue, "dogs");
  assert.equal(detectionResult[1]?.format, "code_128");
}
