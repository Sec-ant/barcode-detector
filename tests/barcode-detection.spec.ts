declare const __PORT__: string;

import { assert, describe, test } from "vitest";
import { BarcodeDetector } from "../src/index.js";
import {
  drawImageToCanvas,
  getHTMLImage,
  getIframeCanvas,
  getIframeHtmlImage,
  getIframeVideo,
  getVideo,
} from "./helpers.js";

function areCatsAndDogs(detectionResult: DetectedBarcode[]) {
  assert.equal(detectionResult.length, 2, "Number of barcodes");
  assert.equal(detectionResult[0]?.rawValue, "cats", "barcode 1");
  assert.equal(detectionResult[0]?.format, "qr_code", "barcode 1 format");
  assert.equal(detectionResult[1]?.rawValue, "dogs", "barcode 2");
  assert.equal(detectionResult[1]?.format, "code_128", "barcode 2 format");
}

test("detectedBarcode.boundingBox should be DOMRectReadOnly", async () => {
  const image = await getHTMLImage();

  const canvas = drawImageToCanvas(image, {
    canvas: document.createElement("canvas"),
  });

  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(
    canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height),
  );

  for (const { boundingBox } of detectionResult) {
    assert.isTrue(boundingBox instanceof DOMRectReadOnly);
  }
});

test("detectedBarcode can be passed to postMessage()", async () => {
  const image = await getHTMLImage();

  const canvas = drawImageToCanvas(image, {
    canvas: document.createElement("canvas"),
  });

  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(
    canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height),
  );

  const handleMessage = ({
    data: passedDetectionResult,
  }: MessageEvent<DetectedBarcode[]>) => {
    assert.deepEqual(passedDetectionResult, detectionResult);
    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);

  window.postMessage(detectionResult);
});

test("get supported barcode formats", async () => {
  const supportedFormats = await BarcodeDetector.getSupportedFormats();

  assert.includeMembers(supportedFormats as string[], [
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
  ]);
});

// TODO: web worker test

test("new BarcodeDetector() throws on invalid formats", async () => {
  const invalidFormatsList = [[], ["unknown"], ["foo", "bar"]];
  for (const invalidFormats of invalidFormatsList) {
    assert.throw(
      () => {
        new BarcodeDetector({
          formats: invalidFormats as BarcodeFormat[],
        });
      },
      TypeError,
      undefined,
      `${JSON.stringify(invalidFormats)} contains invalid formats`,
    );
  }
});

describe("BarcodeDetector.detect() accepts", () => {
  for (const { createCanvas, pixelFormat, name } of [
    {
      createCanvas: () => {
        return document.createElement("canvas");
      },
      pixelFormat: "uint8",
      name: "BarcodeDetector.detect() accepts an HTMLCanvasElement",
    },
    {
      createCanvas: () => {
        return document.createElement("canvas");
      },
      pixelFormat: "float16",
      name: "BarcodeDetector.detect() accepts an HTMLCanvasElementF16Format",
    },
    {
      createCanvas: () => {
        return new OffscreenCanvas(300, 150);
      },
      pixelFormat: "uint8",
      name: "BarcodeDetector.detect() accepts an OffscreenCanvas",
    },
  ]) {
    test(name, async () => {
      const image = await getHTMLImage();
      const canvas = drawImageToCanvas(image, {
        canvas: createCanvas(),
        pixelFormat,
      });
      const barcodeDetector = new BarcodeDetector();
      const detectionResult = await barcodeDetector.detect(canvas);
      areCatsAndDogs(detectionResult);
    });
  }

  test("BarcodeDetector.detect() accepts an HTMLImageElement", async () => {
    const image = await getHTMLImage();
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(image);
    areCatsAndDogs(detectionResult);
  });

  test("BarcodeDetector.detect() accepts a 0x0 sized HTMLImageElement", async () => {
    const image = await getHTMLImage(
      new URL("./resources/red-zerosize.svg", import.meta.url).href,
    );
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(image);
    assert.isEmpty(detectionResult);
  });

  test("BarcodeDetector.detect() accepts an HTMLVideoElement", async () => {
    const video = await getVideo();
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(video);
    areCatsAndDogs(detectionResult);
  });

  test("BarcodeDetector.detect() accepts an ImageBitmap", async () => {
    const image = await getHTMLImage();
    const imageBitmap = await createImageBitmap(image);
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(imageBitmap);
    areCatsAndDogs(detectionResult);
  });

  test("BarcodeDetector.detect() accepts an ImageData", async () => {
    const image = await getHTMLImage();
    const canvas = drawImageToCanvas(image, {
      canvas: document.createElement("canvas"),
    });

    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(
      canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height)!,
    );
    areCatsAndDogs(detectionResult);
  });

  test("BarcodeDetector.detect() accepts an iframe HTMLImageElement", async () => {
    const image = await getIframeHtmlImage();
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(image);
    areCatsAndDogs(detectionResult);
  });

  test("BarcodeDetector.detect() accepts an iframe HTMLVideoElement", async () => {
    const video = await getIframeVideo();
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(video);
    areCatsAndDogs(detectionResult);
  });

  test("BarcodeDetector.detect() accepts an iframe ImageData", async () => {
    const canvas = await getIframeCanvas();
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(
      canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height)!,
    );
    areCatsAndDogs(detectionResult);
  });
});

describe("BarcodeDetector.detect() rejects", () => {
  describe("BarcodeDetector.detect() rejects on a cross-origin ImageBitmapSource", () => {
    test("cross-origin HTMLImageElement", async () => {
      let image: HTMLImageElement;
      try {
        image = await getHTMLImage(
          `http://localhost:${__PORT__}/resources/cats-dogs.png`,
        );
      } catch (e) {
        assert.fail(String(e));
      }
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image);
        assert.fail(
          "cross-origin HTMLImageElement should trigger a detection error",
        );
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.SECURITY_ERR);
      }
    });

    test("cross-origin ImageBitmap", async () => {
      let image: HTMLImageElement;
      try {
        image = await getHTMLImage(
          `http://localhost:${__PORT__}/resources/cats-dogs.png`,
        );
      } catch (e) {
        assert.fail(String(e));
      }
      const imageBitmap = await createImageBitmap(image);
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

    test("cross-origin HTMLCanvasElement", async () => {
      let image: HTMLImageElement;
      try {
        image = await getHTMLImage(
          `http://localhost:${__PORT__}/resources/cats-dogs.png`,
        );
      } catch (e) {
        assert.fail(String(e));
      }
      const imageBitmap = await createImageBitmap(image);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("bitmaprenderer")!;
      context.transferFromImageBitmap(imageBitmap);
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

    test("cross-origin HTMLVideoElement", async () => {
      let video: HTMLVideoElement;
      try {
        video = await getVideo(
          `http://localhost:${__PORT__}/resources/cats-dogs.webm`,
        );
      } catch (e) {
        assert.fail(String(e));
      }
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
  });

  test("BarcodeDetector.detect() rejects on a broken HTMLImageElement", async () => {
    try {
      await getHTMLImage("./images/broken.png");
      assert.fail("broken image should not resolve");
    } catch (e: unknown) {
      const image = (e as [unknown, HTMLImageElement])[1];
      // now the image is a broken HTMLImageElement
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image as HTMLImageElement);
        assert.fail("broken image should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    }
  });

  test("BarcodeDetector.detect() rejects on an empty src HTMLImageElement", async () => {
    try {
      await getHTMLImage("");
      assert.fail("empty src image should not resolve");
    } catch (e: unknown) {
      const image = (e as [unknown, HTMLImageElement])[1];
      // now the image is an empty src HTMLImageElement
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(image as HTMLImageElement);
        assert.fail("empty src image should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    }
  });

  test("BarcodeDetector.detect() rejects on a broken HTMLVideoElement", async () => {
    try {
      await getVideo("./images/broken.webm");
      assert.fail("broken video should not resolve");
    } catch (e: unknown) {
      const video = (e as [unknown, HTMLVideoElement])[1];
      const barcodeDetector = new BarcodeDetector();
      try {
        await barcodeDetector.detect(video as HTMLVideoElement);
        assert.fail("broken video should trigger a detection error");
      } catch (e) {
        assert.instanceOf(e, DOMException);
        assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
      }
    }
  });

  test("BarcodeDetector.detect() rejects on a buffer-detached ImageData ", async () => {
    const data = new ImageData(1024, 1024);
    window.postMessage("", "*", [data.data.buffer]);
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(data);
      assert.fail("detached ImageData buffer should trigger a detection error");
    } catch (e) {
      assert.instanceOf(e, DOMException);
      assert.equal((e as DOMException)?.code, DOMException.INVALID_STATE_ERR);
    }
  });

  test.skip("BarcodeDetector.detect() rejects on a non-image type Blob", async () => {
    const blob = new Blob(["not really a png"], { type: "image/png " });
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(blob);
      assert.fail("invalid image blob should trigger a detection error");
    } catch (e) {
      assert.instanceOf(e, DOMException);
      assert.equal((e as DOMException)?.code, DOMException.NOT_SUPPORTED_ERR);
    }
  });

  test.skip("BarcodeDetector.detect() rejects on an SVGImageElement", async () => {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(image);
      assert.fail("empty svg image should trigger a detection error");
    } catch (e) {
      assert.instanceOf(e, DOMException);
      assert.equal((e as DOMException)?.code, DOMException.NOT_SUPPORTED_ERR);
    }
  });

  test.skip("BarcodeDetector.detect() rejects on a VideoFrame", async () => {
    const canvas = document.createElement("canvas");
    const frame = new VideoFrame(canvas, { timestamp: 0 });
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(frame);
      assert.fail("empty frame should trigger a detection error");
    } catch (e) {
      assert.instanceOf(e, DOMException);
      assert.equal((e as DOMException)?.code, DOMException.NOT_SUPPORTED_ERR);
    }
  });

  test("BarcodeDetector.detect() rejects on a closed ImageBitmap", async () => {
    const image = await getHTMLImage();
    const imageBitmap = await createImageBitmap(image);
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
