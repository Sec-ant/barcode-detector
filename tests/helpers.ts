export async function getHTMLImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.addEventListener("error", (error) => {
      reject([error, image] as const);
    });
    image.src = src;
  });
}

export async function getIframeHtmlImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeImage = iframe.contentDocument?.querySelector("img");
      if (iframeImage) {
        resolve(iframeImage);
      } else {
        reject(new DOMException("Image not found in iframe!", "NotFoundError"));
      }
    });
    iframe.addEventListener("error", (error) => {
      reject([error, iframe] as const);
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

export async function getSVGImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  return await new Promise<SVGImageElement>((resolve, reject) => {
    const htmlImagePromise = getHTMLImage(src);
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
    image.addEventListener("error", (error) => {
      reject([error, image] as const);
    });
    image.href.baseVal = src;
  });
}

export async function getVideo(
  src = new URL("./resources/cats-dogs.webm", import.meta.url).href,
) {
  return await new Promise<HTMLVideoElement>((resolve, reject) => {
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
      (error) => {
        reject([error, video] as const);
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
  return await new Promise<HTMLVideoElement>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeVideo = iframe.contentDocument?.querySelector("video");
      if (iframeVideo) {
        iframeVideo.addEventListener(
          "loadeddata",
          async () => {
            await seekTo(iframeVideo, 0);
            resolve(iframeVideo);
          },
          { once: true },
        );
        iframeVideo.addEventListener("error", (error) => {
          reject([error, iframeVideo] as const);
        });
        iframeVideo.load();
      } else {
        reject(new DOMException("Video not found in iframe!", "NotFoundError"));
      }
    });
    iframe.addEventListener("error", (error) => {
      reject([error, iframe] as const);
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

export async function getIframeCanvas(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href,
) {
  const image = await getHTMLImage(src);
  return await new Promise<HTMLCanvasElement>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      const iframeCanvas = iframe.contentDocument?.querySelector("canvas");
      if (iframeCanvas) {
        iframeCanvas.width = image.width;
        iframeCanvas.height = image.height;
        (
          iframeCanvas.getContext("2d") as
            | CanvasRenderingContext2D
            | OffscreenCanvasRenderingContext2D
        ).drawImage(image, 0, 0, image.width, image.height);
        resolve(iframeCanvas);
      } else {
        reject(
          new DOMException("Canvas not found in iframe!", "NotFoundError"),
        );
      }
    });
    iframe.addEventListener("error", (error) => {
      reject([error, iframe] as const);
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
>(
  image: HTMLImageElement,
  {
    canvas,
    pixelFormat,
  }: {
    canvas: T;
    pixelFormat?: string;
  },
): T {
  canvas.width = image.width;
  canvas.height = image.height;
  (
    canvas.getContext("2d", {
      pixelFormat,
    }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ).drawImage(image, 0, 0, image.width, image.height);
  return canvas;
}
