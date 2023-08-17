export const BARCODE_DETECTOR_FORMATS = [
  "aztec",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "data_matrix",
  "ean_13",
  "ean_8",
  "itf",
  "pdf417",
  "qr_code",
  "upc_a",
  "upc_e",
  "unknown",
] as const;

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
  throw new TypeError(
    "The provided value is not of type '(Blob or HTMLCanvasElement or HTMLImageElement or HTMLVideoElement or ImageBitmap or ImageData or OffscreenCanvas or SVGImageElement or VideoFrame)'."
  );
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
    throw void 0;
  } catch {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}

export async function getImageDataFromCanvasImageSource(
  canvasImageSource: CanvasImageSourceWebCodecs
): Promise<ImageData | null> {
  if (
    isHTMLImageElement(canvasImageSource) &&
    !(await isHTMLImageElementDecodable(canvasImageSource))
  ) {
    throw new DOMException(
      "Failed to load or decode HTMLImageElement.",
      "InvalidStateError"
    );
  }
  if (
    isSVGImageElement(canvasImageSource) &&
    !(await isSVGImageElementDecodable(canvasImageSource))
  ) {
    throw new DOMException(
      "Failed to load or decode SVGImageElement.",
      "InvalidStateError"
    );
  }
  if (
    isHTMLVideoElement(canvasImageSource) &&
    (canvasImageSource.readyState === 0 || canvasImageSource.readyState === 1)
  ) {
    throw new DOMException("Invalid element or state.", "InvalidStateError");
  }
  if (
    isImageBitmap(canvasImageSource) &&
    isImageBitmapClosed(canvasImageSource)
  ) {
    throw new DOMException(
      "The image source is detached.",
      "InvalidStateError"
    );
  }
  const { width, height } =
    getIntrinsicDimensionsOfCanvasImageSource(canvasImageSource);
  if (width === 0 || height === 0) {
    return null;
  }
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  context.drawImage(canvasImageSource, 0, 0);
  const imageData = context.getImageData(0, 0, width, height);
  return imageData;
}

export async function getImageDataFromBlob(
  blob: Blob
): Promise<ImageData | null> {
  let imageBitmap: ImageBitmap;
  try {
    imageBitmap = await createImageBitmap(blob);
  } catch (e) {
    throw new DOMException("Unsupported source.", "NotSupportedError");
  }
  const imageData = await getImageDataFromCanvasImageSource(imageBitmap);
  return imageData;
}

export async function getImageDataFromImageBitmapSource(
  image: ImageBitmapSourceWebCodecs
): Promise<ImageData | null> {
  if (isBlob(image)) {
    return await getImageDataFromBlob(image);
  }
  if (isImageData(image)) {
    if (isImageDataArrayBufferDetached(image)) {
      throw new DOMException(
        "The image data has been detached.",
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

declare global {
  interface SVGImageElement {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/SVGImageElement/decode) */
    // Not supported in Safari, 2023.8.18
    decode?(): Promise<void>;
  }
}

export async function isSVGImageElementDecodable(image: SVGImageElement) {
  try {
    await image.decode?.();
    return true;
  } catch {
    return false;
  }
}

export function isImageDataArrayBufferDetached(image: ImageData) {
  if (image.data.buffer.byteLength !== 0) {
    return false;
  }
  // detached buffers will always have zero byteLength
  return true;
}

export function isImageBitmapClosed(imageBitmap: ImageBitmap) {
  if (imageBitmap.width === 0 && imageBitmap.height === 0) {
    return true;
  }
  return false;
}

export function addPrefixToExceptionOrError(e: unknown, prefix: string) {
  if (e instanceof DOMException) {
    return new DOMException(`${prefix}: ${e.message}`, e.name);
  }
  if (e instanceof Error) {
    return new (e.constructor as
      | ErrorConstructor
      | EvalErrorConstructor
      | TypeErrorConstructor
      | RangeErrorConstructor
      | SyntaxErrorConstructor
      | ReferenceErrorConstructor)(`${prefix}: ${e.message}`);
  }
  return new Error(`${prefix}: ${e}`);
}
