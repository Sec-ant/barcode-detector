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

function getIntrinsicDimensionsOfCanvasImageSource(
  image: CanvasImageSourceWebCodecs,
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
  if (isImageBitmap(image)) {
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
  if (isHTMLCanvasElement(image)) {
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
  throw new TypeError(
    "The provided value is not of type '(Blob or HTMLCanvasElement or HTMLImageElement or HTMLVideoElement or ImageBitmap or ImageData or OffscreenCanvas or SVGImageElement or VideoFrame)'.",
  );
}

function isHTMLImageElement(
  image: ImageBitmapSourceWebCodecs,
): image is HTMLImageElement {
  try {
    return image instanceof HTMLImageElement;
  } catch {
    return false;
  }
}

function isSVGImageElement(
  image: ImageBitmapSourceWebCodecs,
): image is SVGImageElement {
  try {
    return image instanceof SVGImageElement;
  } catch {
    return false;
  }
}

function isHTMLVideoElement(
  image: ImageBitmapSourceWebCodecs,
): image is HTMLVideoElement {
  try {
    return image instanceof HTMLVideoElement;
  } catch {
    return false;
  }
}

function isHTMLCanvasElement(
  image: ImageBitmapSourceWebCodecs,
): image is HTMLCanvasElement {
  try {
    return image instanceof HTMLCanvasElement;
  } catch {
    return false;
  }
}

function isImageBitmap(
  image: ImageBitmapSourceWebCodecs,
): image is ImageBitmap {
  try {
    return image instanceof ImageBitmap;
  } catch {
    return false;
  }
}

function isOffscreenCanvas(
  image: ImageBitmapSourceWebCodecs,
): image is OffscreenCanvas {
  try {
    return image instanceof OffscreenCanvas;
  } catch {
    return false;
  }
}

function isVideoFrame(image: ImageBitmapSourceWebCodecs): image is VideoFrame {
  try {
    return image instanceof VideoFrame;
  } catch {
    return false;
  }
}

function isBlob(image: ImageBitmapSourceWebCodecs): image is Blob {
  try {
    return image instanceof Blob;
  } catch {
    return false;
  }
}

function isImageData(image: ImageBitmapSourceWebCodecs): image is ImageData {
  try {
    return image instanceof ImageData;
  } catch {
    return false;
  }
}

function createCanvas(
  width: number,
  height: number,
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

async function getImageDataFromCanvasImageSource(
  canvasImageSource: CanvasImageSourceWebCodecs,
): Promise<ImageData | null> {
  if (
    isHTMLImageElement(canvasImageSource) &&
    !(await isHTMLImageElementDecodable(canvasImageSource))
  ) {
    throw new DOMException(
      "Failed to load or decode HTMLImageElement.",
      "InvalidStateError",
    );
  }
  if (
    isSVGImageElement(canvasImageSource) &&
    !(await isSVGImageElementDecodable(canvasImageSource))
  ) {
    // TODO(https://github.com/chromium/chromium/blob/fe4f6d2155412504930c9d1c53892af5aac1db8d/third_party/blink/renderer/modules/shapedetection/shape_detector.cc#L59-L63):
    // SVGImageElement type inputs are not supported in Chromium.
    // We still support svg images, but we should reject on those that cannot be decoded.
    throw new DOMException(
      "Failed to load or decode SVGImageElement.",
      "InvalidStateError",
    );
  }
  if (
    isVideoFrame(canvasImageSource) &&
    isVideoFrameClosed(canvasImageSource)
  ) {
    // TODO(https://github.com/chromium/chromium/blob/fe4f6d2155412504930c9d1c53892af5aac1db8d/third_party/blink/renderer/modules/shapedetection/shape_detector.cc#L59-L63):
    // VideoFrame type inputs are not supported in Chromium.
    // We still support video frames, but we should reject on those that are closed.
    throw new DOMException("VideoFrame is closed.", "InvalidStateError");
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
      "InvalidStateError",
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
  try {
    const imageData = context.getImageData(0, 0, width, height);
    return imageData;
  } catch (e) {
    throw new DOMException("Source would taint origin.", "SecurityError");
  }
}

async function getImageDataFromBlob(blob: Blob): Promise<ImageData | null> {
  let imageBitmap: ImageBitmap;
  try {
    imageBitmap = await createImageBitmap(blob);
  } catch {
    // TODO(https://github.com/chromium/chromium/blob/fe4f6d2155412504930c9d1c53892af5aac1db8d/third_party/blink/renderer/modules/shapedetection/shape_detector.cc#L59-L63):
    // Blob type inputs are not supported in Chromium.
    // We still support blobs, but we should reject on non-image blobs.
    throw new DOMException(
      "Failed to load or decode Blob.",
      "InvalidStateError",
    );
  }
  const imageData = await getImageDataFromCanvasImageSource(imageBitmap);
  return imageData;
}

function getImageDataFromCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): ImageData | null {
  const { width, height } = canvas;
  if (width === 0 || height === 0) {
    return null;
  }
  const context = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  try {
    const imageData = context.getImageData(0, 0, width, height);
    return imageData;
  } catch (e) {
    throw new DOMException("Source would taint origin.", "SecurityError");
  }
}

export async function getImageDataFromImageBitmapSource(
  image: ImageBitmapSourceWebCodecs,
): Promise<ImageData | null> {
  if (isBlob(image)) {
    return await getImageDataFromBlob(image);
  }
  if (isImageData(image)) {
    if (isImageDataArrayBufferDetached(image)) {
      throw new DOMException(
        "The image data has been detached.",
        "InvalidStateError",
      );
    }
    return image;
  }
  if (isHTMLCanvasElement(image) || isOffscreenCanvas(image)) {
    return getImageDataFromCanvas(image);
  }
  return await getImageDataFromCanvasImageSource(image);
}

async function isHTMLImageElementDecodable(image: HTMLImageElement) {
  try {
    await image.decode();
    return true;
  } catch {
    return false;
  }
}

declare global {
  interface SVGImageElement {
    // TODO(https://developer.mozilla.org/docs/Web/API/SVGImageElement/decode):
    // SVGImageElement.prototype.decode is not supported in Safari, 2023.8.18
    decode?(): Promise<void>;
  }
}

async function isSVGImageElementDecodable(image: SVGImageElement) {
  try {
    await image.decode?.();
    return true;
  } catch {
    return false;
  }
}

function isVideoFrameClosed(image: VideoFrame) {
  // The format of a closed VideoFrame is null.
  // Not sure if this is the correct way to check closed frames though.
  if (image.format === null) {
    return true;
  }
  return false;
}

function isImageDataArrayBufferDetached(image: ImageData) {
  if (image.data.buffer.byteLength !== 0) {
    return false;
  }
  // Detached buffers will always have zero byteLength
  return true;
}

function isImageBitmapClosed(imageBitmap: ImageBitmap) {
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
