///<reference types="vite/client" />
import { assert, afterAll, beforeAll, describe, test, vi } from "vitest";
import {
  BarcodeDetector,
  type BarcodeFormat,
  type DetectedBarcode,
  prepareZXingModule,
  purgeZXingModule,
} from "../src/ponyfill.js";
import { BARCODE_FORMATS } from "../src/utils.js";
import {
  BROKEN_IMAGE_URL,
  BROKEN_VIDEO_URL,
  ZERO_SIZE_IMAGE_URL,
} from "./consts.js";
import { areCats } from "./utils/areCats.js";
import { areCatsAndDogs } from "./utils/areCatsAndDogs.js";
import { getBlob } from "./utils/getBlob.js";
import { getCanvas } from "./utils/getCanvas.js";
import { getDomImageBitmp } from "./utils/getDomImageBitmap.js";
import { getDomOffscreenCanvas } from "./utils/getDomOffscreenCanvas.js";
import { getHtmlImage } from "./utils/getHtmlImage.js";
import { getIframeBlob } from "./utils/getIframeBlob.js";
import { getIframeCanvas } from "./utils/getIframeCanvas.js";
import { getIframeHtmlImage } from "./utils/getIframeHtmlImage.js";
import { getIframeImageBitmap } from "./utils/getIframeImageBitmap.js";
import { getIframeImageData } from "./utils/getIframeImageData.js";
import { getIframeOffscreenCanvas } from "./utils/getIframeOffscreenCanvas.js";
import { getIframeSvgImage } from "./utils/getIframeSvgImage.js";
import { getIframeVideo } from "./utils/getIframeVideo.js";
import { getIframeVideoFrame } from "./utils/getIframeVideoFrame.js";
import { getImageBitmap } from "./utils/getImageBitmap.js";
import { getImageData } from "./utils/getImageData.js";
import { getOffscreenCanvas } from "./utils/getOffscreenCanvas.js";
import { getSvgImage } from "./utils/getSvgImage.js";
import { getVideo } from "./utils/getVideo.js";
import { getVideoFrame } from "./utils/getVideoFrame.js";
import type {
  MessageRequestData,
  MessageResponseData,
} from "./utils/messageData.js";
import BarcodeDetectionWorker from "./worker.js?worker";

declare const __PORT__: string;

// TODO: web worker test

describe("new BarcodeDetector()", () => {
  test("should throw type error if provided formats is empty", () => {
    try {
      new BarcodeDetector({ formats: [] });
      assert.fail("should throw type error if formats is empty");
    } catch (e) {
      assert.instanceOf(e, TypeError);
      assert.equal(
        e.message,
        "Failed to construct 'BarcodeDetector': Hint option provided, but is empty.",
      );
    }
  });

  test('should throw type error if provided formats contains "unknown"', () => {
    try {
      new BarcodeDetector({ formats: ["unknown"] });
      assert.fail("should throw type error if formats contains 'unknown'");
    } catch (e) {
      assert.instanceOf(e, TypeError);
      assert.equal(
        e.message,
        "Failed to construct 'BarcodeDetector': Hint option provided, but is empty.",
      );
    }
  });

  test("should throw type error if provided formats contains invalid format", () => {
    const invalidFormat = "42" as BarcodeFormat;
    try {
      new BarcodeDetector({ formats: [invalidFormat] });
      assert.fail("should throw type error if formats contains invalid format");
    } catch (e) {
      assert.instanceOf(e, TypeError);
      assert.equal(
        e.message,
        `Failed to construct 'BarcodeDetector': Failed to read the 'formats' property from 'BarcodeDetectorOptions': The provided value '${invalidFormat}' is not a valid enum value of type BarcodeFormat.`,
      );
    }
  });
});

describe("BarcodeDetector.getSupportedFormats()", () => {
  test("should return supported formats", async () => {
    const supportedFormats = await BarcodeDetector.getSupportedFormats();
    assert.deepEqual(
      supportedFormats,
      BARCODE_FORMATS.filter((f) => f !== "unknown"),
    );
  });
});

describe("BarcodeDetector.prototype.detect()", () => {
  let worker: Worker;

  beforeAll(() => {
    worker = new BarcodeDetectionWorker();
  });

  afterAll(() => {
    worker.terminate();
  });

  describe("HTMLImageElement", () => {
    test("accepts an HTMLImageElement", async () => {
      const img = await getHtmlImage();
      assert.instanceOf(img, HTMLImageElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(img);
      areCatsAndDogs(detectionResult);
    });

    test("accepts a 0x0 sized HTMLImageElement", async () => {
      const img = await getHtmlImage(ZERO_SIZE_IMAGE_URL);
      assert.equal(img.width, 0);
      assert.equal(img.height, 0);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(img);
      assert.isEmpty(detectionResult);
    });

    test("accepts an <iframe> HTMLImageElement", async () => {
      const img = await getIframeHtmlImage();
      assert.notInstanceOf(img, HTMLImageElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(img);
      areCatsAndDogs(detectionResult);
    });

    test("rejects a cross-origin HTMLImageElement", async () => {
      const img = await getHtmlImage(
        `http://localhost:${__PORT__}/resources/cats-dogs.png`,
      );
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(img);
        assert.fail(
          "cross-origin HTMLImageElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.SECURITY_ERR);
      }
    });

    test("rejects a broken HTMLImageElement", async () => {
      const img = await getHtmlImage(BROKEN_IMAGE_URL);
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(img);
        assert.fail("broken HTMLImageElement should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects an empty src HTMLImageElement", async () => {
      const img = await getHtmlImage("");
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(img);
        assert.fail(
          "empty src HTMLImageElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects an empty HTMLImageElement", async () => {
      const img = document.createElement("img");
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(img);
        assert.fail("empty HTMLImageElement should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });
  });

  describe("HTMLCanvasElement", () => {
    test("accepts an HTMLCanvasElement", async () => {
      const canvas = await getCanvas();
      assert.instanceOf(canvas, HTMLCanvasElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(canvas);
      areCatsAndDogs(detectionResult);
    });

    test("accepts a 0x0 sized HTMLCanvasElement", async () => {
      const canvas = await getCanvas(ZERO_SIZE_IMAGE_URL);
      assert.equal(canvas.width, 0);
      assert.equal(canvas.height, 0);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(canvas);
      assert.isEmpty(detectionResult);
    });

    test("accepts an <iframe> HTMLCanvasElement", async () => {
      const canvas = await getIframeCanvas();
      assert.notInstanceOf(canvas, HTMLCanvasElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(canvas);
      areCatsAndDogs(detectionResult);
    });

    test("rejects a cross-origin HTMLCanvasElement", async () => {
      const canvas = await getCanvas(
        `http://localhost:${__PORT__}/resources/cats-dogs.png`,
      );
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(canvas);
        assert.fail(
          "cross-origin HTMLCanvasElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.SECURITY_ERR);
      }
    });
  });

  describe("OffscreenCanvas", () => {
    test("accepts an OffscreenCanvas", async () => {
      const canvas = await getOffscreenCanvas();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(canvas);
      areCatsAndDogs(detectionResult);
    });

    test("accepts a 0x0 sized OffscreenCanvas", async () => {
      const canvas = await getDomOffscreenCanvas(ZERO_SIZE_IMAGE_URL);
      assert.equal(canvas.width, 0);
      assert.equal(canvas.height, 0);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(canvas);
      assert.isEmpty(detectionResult);
    });

    test("accepts an <iframe> OffscreenCanvas", async () => {
      const canvas = await getIframeOffscreenCanvas();
      assert.notInstanceOf(canvas, OffscreenCanvas);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(canvas);
      areCatsAndDogs(detectionResult);
    });

    test("accepts an OffscreenCanvas in a web worker", async () => {
      const fingerPrint = Math.random();
      const messageRequestData: MessageRequestData = {
        imageType: "offscreenCanvas",
        fingerPrint,
      };
      const detectedBarcodesPromise = new Promise<DetectedBarcode[]>(
        (resolve, reject) => {
          worker.onmessage = ({ data }: MessageEvent<MessageResponseData>) => {
            if (data.fingerPrint !== fingerPrint) {
              return;
            }
            if ("error" in data) {
              reject(data.error);
              return;
            }
            resolve(data.detectedBarcodes);
          };
        },
      );
      worker.postMessage(messageRequestData);
      const detectedBarcodes = await detectedBarcodesPromise;
      areCatsAndDogs(detectedBarcodes);
    });

    test("rejects a cross-origin OffscreenCanvas", async () => {
      const canvas = await getDomOffscreenCanvas(
        `http://localhost:${__PORT__}/resources/cats-dogs.png`,
      );
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(canvas);
        assert.fail(
          "cross-origin OffscreenCanvas should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.SECURITY_ERR);
      }
    });
  });

  describe("SVGImageElement", () => {
    test("accepts an SVGImageElement", async () => {
      const image = await getSvgImage();
      assert.instanceOf(image, SVGImageElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);
      areCatsAndDogs(detectionResult);
    });

    test("accepts a 0x0 sized SVGImageElement", async () => {
      const image = await getSvgImage(ZERO_SIZE_IMAGE_URL);
      assert.equal(image.width.baseVal.value, 0);
      assert.equal(image.height.baseVal.value, 0);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);
      assert.isEmpty(detectionResult);
    });

    test("accepts an <iframe> SVGImageElement", async () => {
      const image = await getIframeSvgImage();
      assert.notInstanceOf(image, SVGImageElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);
      areCatsAndDogs(detectionResult);
    });

    test("rejects a cross-origin SVGImageElement", async () => {
      const image = await getSvgImage(
        `http://localhost:${__PORT__}/resources/cats-dogs.png`,
      );
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image);
        assert.fail(
          "cross-origin SVGImageElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.SECURITY_ERR);
      }
    });

    test("rejects a broken SVGImageElement", async () => {
      const image = await getSvgImage(BROKEN_IMAGE_URL);
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image);
        assert.fail("broken SVGImageElement should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects an empty src SVGImageElement", async () => {
      const image = await getSvgImage("");
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image);
        assert.fail(
          "empty src SVGImageElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects an empty SVGImageElement", async () => {
      const image = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image",
      );
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image);
        assert.fail("empty SVGImageElement should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });
  });

  describe("HTMLVideoElement", () => {
    test("accepts an HTMLVideoElement", async () => {
      const video = await getVideo();
      assert.instanceOf(video, HTMLVideoElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(video);
      areCatsAndDogs(detectionResult);
    });

    test("accepts an <iframe> HTMLVideoElement", async () => {
      const video = await getIframeVideo();
      assert.notInstanceOf(video, HTMLVideoElement);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(video);
      areCatsAndDogs(detectionResult);
    });

    test("rejects a cross-origin HTMLVideoElement", async () => {
      const video = await getVideo(
        `http://localhost:${__PORT__}/resources/cats-dogs.webm`,
      );
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(video);
        assert.fail(
          "cross-origin HTMLVideoElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.SECURITY_ERR);
      }
    });

    test("rejects a broken HTMLVideoElement", async () => {
      const video = await getVideo(BROKEN_VIDEO_URL);
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(video);
        assert.fail("broken HTMLVideoElement should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects an empty src HTMLVideoElement", async () => {
      const video = await getVideo("");
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(video);
        assert.fail(
          "empty src HTMLVideoElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects an empty HTMLVideoElement", async () => {
      const video = document.createElement("video");
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(video);
        assert.fail("empty HTMLVideoElement should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });
  });

  describe("Blob", () => {
    test("accepts a Blob", async () => {
      const blob = await getBlob();
      assert.instanceOf(blob, Blob);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(blob);
      areCatsAndDogs(detectionResult);
    });

    test("accepts a 0x0 sized Blob", async () => {
      const blob = await getBlob(ZERO_SIZE_IMAGE_URL);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(blob);
      assert.isEmpty(detectionResult);
    });

    test("accepts an <iframe> Blob", async () => {
      const blob = await getIframeBlob();
      assert.notInstanceOf(blob, Blob);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(blob);
      areCatsAndDogs(detectionResult);
    });

    test("accepts a Blob in a web worker", async () => {
      const fingerPrint = Math.random();
      const messageRequestData: MessageRequestData = {
        imageType: "blob",
        fingerPrint,
      };
      const detectedBarcodesPromise = new Promise<DetectedBarcode[]>(
        (resolve, reject) => {
          worker.onmessage = ({ data }: MessageEvent<MessageResponseData>) => {
            if (data.fingerPrint !== fingerPrint) {
              return;
            }
            if ("error" in data) {
              reject(data.error);
              return;
            }
            resolve(data.detectedBarcodes);
          };
        },
      );
      worker.postMessage(messageRequestData);
      const detectedBarcodes = await detectedBarcodesPromise;
      areCatsAndDogs(detectedBarcodes);
    });

    test("rejects a fake image type Blob", async () => {
      const blob = new Blob(["not really a png"], { type: "image/png" });
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(blob);
        assert.fail("fake image blob should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects a broken image type Blob", async () => {
      const blob = await getBlob(BROKEN_IMAGE_URL);
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(blob);
        assert.fail("broken Blob should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });

    test("rejects a non-image type Blob", async () => {
      const blob = new Blob(["not an image"], { type: "text/plain" });
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(blob);
        assert.fail("non-image Blob should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });
  });

  describe("ImageBitmap", () => {
    test("accepts an ImageBitmap", async () => {
      const imageBitmap = await getImageBitmap();
      assert.instanceOf(imageBitmap, ImageBitmap);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(imageBitmap);
      areCatsAndDogs(detectionResult);
    });

    test("accepts an <iframe> ImageBitmap", async () => {
      const imageBitmap = await getIframeImageBitmap();
      assert.notInstanceOf(imageBitmap, ImageBitmap);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(imageBitmap);
      areCatsAndDogs(detectionResult);
    });

    test("accepts an ImageBitmap in a web worker", async () => {
      const fingerPrint = Math.random();
      const messageRequestData: MessageRequestData = {
        imageType: "imageBitmap",
        fingerPrint,
      };
      const detectedBarcodesPromise = new Promise<DetectedBarcode[]>(
        (resolve, reject) => {
          worker.onmessage = ({ data }: MessageEvent<MessageResponseData>) => {
            if (data.fingerPrint !== fingerPrint) {
              return;
            }
            if ("error" in data) {
              reject(data.error);
              return;
            }
            resolve(data.detectedBarcodes);
          };
        },
      );
      worker.postMessage(messageRequestData);
      const detectedBarcodes = await detectedBarcodesPromise;
      areCatsAndDogs(detectedBarcodes);
    });

    test("rejects a cross-origin ImageBitmap", async () => {
      let imageBitmap: ImageBitmap;
      imageBitmap = await getDomImageBitmp(
        `http://localhost:${__PORT__}/resources/cats-dogs.png`,
      );
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(imageBitmap);
        assert.fail(
          "cross-origin ImageBitmap should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.SECURITY_ERR);
      }
    });

    test("rejects a closed ImageBitmap", async () => {
      const imageBitmap = await getImageBitmap();
      imageBitmap.close();
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(imageBitmap);
        assert.fail("closed ImageBitmap should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });
  });

  describe("ImageData", () => {
    test("accepts an ImageData", async () => {
      const imageData = await getImageData();
      assert.instanceOf(imageData, ImageData);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(imageData);
      areCatsAndDogs(detectionResult);
    });

    test("accepts an <iframe> ImageData", async () => {
      const imageData = await getIframeImageData();
      assert.notInstanceOf(imageData, ImageData);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(imageData);
      areCatsAndDogs(detectionResult);
    });

    test("accepts an ImageData in a web worker", async () => {
      const fingerPrint = Math.random();
      const messageRequestData: MessageRequestData = {
        imageType: "imageData",
        fingerPrint,
      };
      const detectedBarcodesPromise = new Promise<DetectedBarcode[]>(
        (resolve, reject) => {
          worker.onmessage = ({ data }: MessageEvent<MessageResponseData>) => {
            if (data.fingerPrint !== fingerPrint) {
              return;
            }
            if ("error" in data) {
              reject(data.error);
              return;
            }
            resolve(data.detectedBarcodes);
          };
        },
      );
      worker.postMessage(messageRequestData);
      const detectedBarcodes = await detectedBarcodesPromise;
      areCatsAndDogs(detectedBarcodes);
    });

    test("rejects a buffer-detached ImageData", async () => {
      const imageData = await getImageData();
      window.postMessage("", "*", [imageData.data.buffer]);
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(imageData);
        assert.fail(
          "detached ImageData buffer should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });
  });

  describe("VideoFrame", () => {
    test("accepts a VideoFrame", async () => {
      const videoFrame = await getVideoFrame();
      assert.instanceOf(videoFrame, VideoFrame);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(videoFrame);
      areCatsAndDogs(detectionResult);
    });

    test("accepts an <iframe> VideoFrame", async () => {
      const videoFrame = await getIframeVideoFrame();
      assert.notInstanceOf(videoFrame, VideoFrame);
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(videoFrame);
      areCatsAndDogs(detectionResult);
    });

    test("accepts a VideoFrame in a web worker", async () => {
      const fingerPrint = Math.random();
      const messageRequestData: MessageRequestData = {
        imageType: "videoFrame",
        fingerPrint,
      };
      const detectedBarcodesPromise = new Promise<DetectedBarcode[]>(
        (resolve, reject) => {
          worker.onmessage = ({ data }: MessageEvent<MessageResponseData>) => {
            if (data.fingerPrint !== fingerPrint) {
              return;
            }
            if ("error" in data) {
              reject(data.error);
              return;
            }
            resolve(data.detectedBarcodes);
          };
        },
      );
      worker.postMessage(messageRequestData);
      const detectedBarcodes = await detectedBarcodesPromise;
      areCatsAndDogs(detectedBarcodes);
    });

    test("rejects a closed VideoFrame", async () => {
      const videoFrame = await getIframeVideoFrame();
      videoFrame.close();
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(videoFrame);
        assert.fail("closed video frame should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    });
  });

  describe("Invalid source", () => {
    test("rejects an invalid source", async () => {
      const invalidSource = {};
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(invalidSource as ImageBitmapSource);
        assert.fail("invalid source should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, TypeError);
        assert.equal(
          e.message,
          "Failed to execute 'detect' on 'BarcodeDetector': The provided value is not of type '(Blob or HTMLCanvasElement or HTMLImageElement or HTMLVideoElement or ImageBitmap or ImageData or OffscreenCanvas or SVGImageElement or VideoFrame)'.",
        );
      }
    });
  });

  describe("no OffscreenCanvas support", () => {
    const originalOffscreenCanvas = globalThis.OffscreenCanvas;

    beforeAll(() => {
      // @ts-expect-error
      // biome-ignore lint/performance/noDelete: test
      delete globalThis.OffscreenCanvas;
    });

    afterAll(() => {
      globalThis.OffscreenCanvas = originalOffscreenCanvas;
    });

    test("can still detect HTMLImageElement", async () => {
      const img = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(img);
      areCatsAndDogs(detectionResult);
    });
  });

  describe("no createImageBitmap and Image support", () => {
    const originalCreateImageBitmap = globalThis.createImageBitmap;
    const originalImage = globalThis.Image;

    beforeAll(() => {
      // @ts-expect-error
      // biome-ignore lint/performance/noDelete: test
      delete globalThis.createImageBitmap;
      // @ts-expect-error
      // biome-ignore lint/performance/noDelete: test
      delete globalThis.Image;
    });

    afterAll(() => {
      globalThis.createImageBitmap = originalCreateImageBitmap;
      globalThis.Image = originalImage;
    });

    test("can still detect Blob", async () => {
      const img = await getBlob();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(img);
      areCatsAndDogs(detectionResult);
    });
  });

  describe("restricted formats", () => {
    test("should only detect the specified formats", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
      const detectionResult = await barcodeDetector.detect(image);
      areCats(detectionResult);
    });

    test("should not detect the unspecified format", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector({ formats: ["aztec"] });
      const detectionResult = await barcodeDetector.detect(image);
      assert.isEmpty(detectionResult);
    });
  });

  describe("service unavailable", () => {
    beforeAll(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      prepareZXingModule({
        overrides: {
          locateFile: () => "",
        },
      });
    });

    afterAll(() => {
      vi.clearAllMocks();
      purgeZXingModule();
    });

    test("should throw a detection error", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image);
        assert.fail("service unavailable should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.NOT_SUPPORTED_ERR);
        assert.equal(
          (e as DOMException)?.message,
          "Failed to execute 'detect' on 'BarcodeDetector': Barcode detection service unavailable.",
        );
      }
    });
  });

  describe("detectedBarcode", () => {
    test("should have a boundingBox", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);

      for (const { boundingBox } of detectionResult) {
        assert.instanceOf(boundingBox, DOMRectReadOnly);
      }
    });

    test("should have a rawValue", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);

      for (const { rawValue } of detectionResult) {
        assert.isString(rawValue);
      }
    });

    test("should have a format", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);

      for (const { format } of detectionResult) {
        assert.isString(format);
      }
    });

    test("should have cornerPoints", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);

      for (const { cornerPoints } of detectionResult) {
        assert.isArray(cornerPoints);
        assert.lengthOf(cornerPoints, 4);
        for (const { x, y } of cornerPoints) {
          assert.isNumber(x);
          assert.isNumber(y);
        }
      }
    });

    test("can be passed to postMessage()", async () => {
      const image = await getHtmlImage();
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(image);

      const handleMessage = ({
        data: passedDetectionResult,
      }: MessageEvent<DetectedBarcode[]>) => {
        assert.deepEqual(passedDetectionResult, detectionResult);
        window.removeEventListener("message", handleMessage);
      };

      window.addEventListener("message", handleMessage);

      window.postMessage(detectionResult);
    });
  });
});
