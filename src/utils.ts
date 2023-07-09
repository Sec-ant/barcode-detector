export function getIntrinsicDimensionsOfCanvasImageSource(
  image: CanvasImageSourceWebCodecs
): { width: number; height: number } {
  if (isHTMLImageElement(image)) {
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }
  if (isSVGImageElement(image)) {
    return {
      width: image.width.baseVal.value,
      height: image.height.baseVal.value,
    };
  }
  if (isHTMLVideoElement(image)) {
    return {
      width: image.videoWidth,
      height: image.videoHeight,
    };
  }
  if (isHTMLCanvasElement(image)) {
    return {
      width: image.width,
      height: image.height,
    };
  }
  if (isImageBitmap(image)) {
    return {
      width: image.width,
      height: image.height,
    };
  }
  if (isOffscreenCanvas(image)) {
    return {
      width: image.width,
      height: image.height,
    };
  }
  if (isVideoFrame(image)) {
    return {
      width: image.displayWidth,
      height: image.displayHeight,
    };
  }
  throw new Error("Unsupported image type");
}

export function isHTMLImageElement(
  image: ImageBitmapSourceWebCodecs
): image is HTMLImageElement {
  try {
    return image instanceof HTMLImageElement;
  } catch {
    return false;
  }
}

export function isSVGImageElement(
  image: ImageBitmapSourceWebCodecs
): image is SVGImageElement {
  try {
    return image instanceof SVGImageElement;
  } catch {
    return false;
  }
}

export function isHTMLVideoElement(
  image: ImageBitmapSourceWebCodecs
): image is HTMLVideoElement {
  try {
    return image instanceof HTMLVideoElement;
  } catch {
    return false;
  }
}

export function isHTMLCanvasElement(
  image: ImageBitmapSourceWebCodecs
): image is HTMLCanvasElement {
  try {
    return image instanceof HTMLCanvasElement;
  } catch {
    return false;
  }
}

export function isImageBitmap(
  image: ImageBitmapSourceWebCodecs
): image is ImageBitmap {
  try {
    return image instanceof ImageBitmap;
  } catch {
    return false;
  }
}

export function isOffscreenCanvas(
  image: ImageBitmapSourceWebCodecs
): image is OffscreenCanvas {
  try {
    return image instanceof OffscreenCanvas;
  } catch {
    return false;
  }
}

export function isVideoFrame(
  image: ImageBitmapSourceWebCodecs
): image is VideoFrame {
  try {
    return image instanceof VideoFrame;
  } catch {
    return false;
  }
}

export function isBlob(image: ImageBitmapSourceWebCodecs): image is Blob {
  try {
    return image instanceof Blob;
  } catch {
    return false;
  }
}

export function isImageData(
  image: ImageBitmapSourceWebCodecs
): image is ImageData {
  try {
    return image instanceof ImageData;
  } catch {
    return false;
  }
}

export function createCanvas(
  width: number,
  height: number
): OffscreenCanvas | HTMLCanvasElement {
  try {
    const canvas = new OffscreenCanvas(width, height);
    if (canvas.getContext("2d") instanceof OffscreenCanvasRenderingContext2D) {
      return canvas;
    }
    throw new Error("OffscreenCanvasRenderingContext2D is not supported");
  } catch {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}

export async function getImageDataFromCanvasImageSource(
  canvasImageSource: CanvasImageSourceWebCodecs
): Promise<ImageData> {
  if (
    isHTMLImageElement(canvasImageSource) &&
    !(await isHTMLImageElementDecodable(canvasImageSource))
  ) {
    throw new DOMException("Failed to decode the image.", "InvalidStateError");
  }
  if (
    isHTMLVideoElement(canvasImageSource) &&
    (canvasImageSource.readyState === 0 || canvasImageSource.readyState === 1)
  ) {
    throw new DOMException(
      "The video data is not available.",
      "InvalidStateError"
    );
  }
  if (isSVGImageElement(canvasImageSource)) {
  }
  if (
    isImageBitmap(canvasImageSource) &&
    isImageBitmapClosed(canvasImageSource)
  ) {
    throw new DOMException("The image bitmap is closed.", "InvalidStateError");
  }
  const { width, height } =
    getIntrinsicDimensionsOfCanvasImageSource(canvasImageSource);
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  context.drawImage(canvasImageSource, 0, 0);
  const imageData = context.getImageData(0, 0, width, height);
  if (isHTMLCanvasElement(canvas)) {
    canvas.remove();
  }
  return imageData;
}

export async function getImageDataFromBlob(blob: Blob): Promise<ImageData> {
  let imageBitmap: ImageBitmap;
  try {
    imageBitmap = await createImageBitmap(blob);
  } catch (e) {
    throw e;
  }
  const imageData = await getImageDataFromCanvasImageSource(imageBitmap);
  return imageData;
}

export async function getImageDataFromImageBitmapSource(
  image: ImageBitmapSourceWebCodecs
): Promise<ImageData> {
  if (isBlob(image)) {
    return await getImageDataFromBlob(image);
  }
  if (isImageData(image)) {
    if (isArrayBufferDetached(image.data.buffer)) {
      throw new DOMException(
        "The corresponding array buffer is detached.",
        "InvalidStateError"
      );
    }
    return image;
  }
  return await getImageDataFromCanvasImageSource(image);
}

export async function isHTMLImageElementDecodable(image: HTMLImageElement) {
  try {
    await image.decode();
    return true;
  } catch {
    return false;
  }
}

export function isArrayBufferDetached(arrayBuffer: ArrayBuffer) {
  if (arrayBuffer.byteLength !== 0) {
    // detached buffers will always have zero byteLength
    return false;
  }
  return true;
  /*
  try {
    new Uint8Array(arrayBuffer);
    return false;
  } catch {
    // Uint8Array throws if using a detached buffer
    return true;
  }
  */
}

export function isImageBitmapClosed(imageBitmap: ImageBitmap) {
  if (imageBitmap.width === 0 && imageBitmap.height === 0) {
    return true;
  }
  return false;
}
