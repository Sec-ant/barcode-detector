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
