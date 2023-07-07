/// <reference types="vite/client" />

import { test, assert, vi } from "vitest";
import "../src/index";
import { getHtmlImage, getVideo, drawImageToCanvas, seekTo } from "./stub";

function areCatsAndDogs(detectionResult: DetectedBarcode[]) {
  assert.equal(detectionResult.length, 2, "Number of barcodes");
  assert.equal(detectionResult[0].rawValue, "cats", "barcode 1");
  assert.equal(detectionResult[0].format, "qr_code", "barcode 1 format");
  assert.equal(detectionResult[1].rawValue, "dogs", "barcode 2");
  assert.equal(detectionResult[1].format, "code_128", "barcode 2 format");
}

test("detectedBarcode.boundingBox should be DOMRectReadOnly", async () => {
  const image = await getHtmlImage();

  const canvas = drawImageToCanvas(image, {
    canvas: document.createElement("canvas"),
  });

  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(
    canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height)!
  );

  detectionResult.forEach(({ boundingBox }) => {
    assert.isTrue(boundingBox instanceof DOMRectReadOnly);
  });
});

test("detectedBarcode can be passed to postMessage()", async () => {
  const image = await getHtmlImage();

  const canvas = drawImageToCanvas(image, {
    canvas: document.createElement("canvas"),
  });

  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(
    canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height)!
  );

  const handleMessage = ({ data: passedDetectionResult }) => {
    assert.deepEqual(passedDetectionResult, detectionResult);
    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);

  window.postMessage(detectionResult);
});

test("BarcodeDetector.detect() rejects on a Blob", async () => {
  const blob = new Blob(["not really a png"], { type: "image/png " });
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(blob);
    assert.fail("invalid image blob should trigger a detection error");
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.NOT_SUPPORTED_ERR);
  }
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
    "unknown",
  ]);
});

[
  {
    createCanvas: () => {
      return document.createElement("canvas");
    },
    pixelFormat: "uint8",
    name: "detect(HTMLCanvasElement)",
  },
  {
    createCanvas: () => {
      return document.createElement("canvas");
    },
    pixelFormat: "float16",
    name: "detect(HTMLCanvasElementF16Format)",
  },
  {
    createCanvas: () => {
      return new OffscreenCanvas(300, 150);
    },
    pixelFormat: "uint8",
    name: "detect(OffscreenCanvas)",
  },
].forEach(({ createCanvas, pixelFormat, name }) => {
  test(name, async () => {
    const image = await getHtmlImage();
    const canvas = drawImageToCanvas(image, {
      canvas: createCanvas(),
      pixelFormat,
    });
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(canvas);
    areCatsAndDogs(detectionResult);
  });
});

test("detect(empty src)", async () => {
  try {
    await getHtmlImage("");
    assert.fail("empty src image should not resolve");
  } catch ([_, image]) {
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(image);
      assert.fail("empty src image should trigger a detection error");
    } catch (e) {
      assert.instanceOf(e, DOMException);
      assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
    }
  }
});

test("detect(0x0)", async () => {
  const image = await getHtmlImage(
    new URL("./resources/red-zerosize.svg", import.meta.url).href
  );
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(image);
  assert.isEmpty(detectionResult);
});

test("detect(HTMLImageElement)", async () => {
  const image = await getHtmlImage();
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(image);
  areCatsAndDogs(detectionResult);
});

test("detect(HTMLVideoElement)", async () => {
  const video = await getVideo();
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(video);
  areCatsAndDogs(detectionResult);
});

test("BarcodeDetector.detect() rejects on a closed ImageBitmap", async () => {
  const image = await getHtmlImage();
  const imageBitmap = await createImageBitmap(image);
  imageBitmap.close();
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(imageBitmap);
    assert.fail("closed ImageBitmap should trigger a detection error");
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
  }
});

test("detect(ImageBitmap)", async () => {
  const image = await getHtmlImage();
  const imageBitmap = await createImageBitmap(image);
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(imageBitmap);
  areCatsAndDogs(detectionResult);
});

test("BarcodeDetector.detect() rejects on a detached buffer", async () => {
  const data = new ImageData(1024, 1024);
  window.postMessage("", "*", [data.data.buffer]);
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(data);
    assert.fail("detached ImageData buffer should trigger a detection error");
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
  }
});

test("detect(ImageData)", async () => {
  const image = await getHtmlImage();
  const canvas = drawImageToCanvas(image, {
    canvas: document.createElement("canvas"),
  });

  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(
    canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height)!
  );
  areCatsAndDogs(detectionResult);
});

test("BarcodeDetector.detect() can process uint16 storage format ImageData", async () => {
  // TODO: check the runtime support for storageFormat
  // @ts-ignore
  const imgUint16 = new ImageData(1024, 1024, {
    storageFormat: "uint16",
  });

  const bacodeDetector = new BarcodeDetector();

  await bacodeDetector.detect(imgUint16);
});

// TODO: web worker test

test("BarcodeDetector.detect() throws on invalid formats", async () => {
  const invalidFormatsList = [[], ["unknown"], ["foo", "bar"]];
  invalidFormatsList.forEach((invalidFormats) => {
    assert.throw(
      () => {
        new BarcodeDetector({
          formats: invalidFormats as BarcodeFormat[],
        });
      },
      TypeError,
      undefined,
      `${JSON.stringify(invalidFormats)} contains invalid formats`
    );
  });
});

test("Barcode - detect(broken image)", async () => {
  try {
    await getHtmlImage("./images/broken.png");
    assert.fail("broken image should not resolve");
  } catch ([error, image]) {
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(image);
      assert.fail("broken image should trigger a detection error");
    } catch (e) {
      assert.instanceOf(e, DOMException);
      assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
    }
  }
});

test("Barcode - detect(broken video)", async () => {
  try {
    await getVideo("./images/broken.webm");
    assert.fail("broken video should not resolve");
  } catch ([error, video]) {
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(video);
      assert.fail("broken video should trigger a detection error");
    } catch (e) {
      assert.instanceOf(e, DOMException);
      assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
    }
  }
});

test("BarcodeDetector.detect() rejects on an SVGImageElement", async () => {
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(image);
    assert.fail("empty svg image should trigger a detection error");
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.NOT_SUPPORTED_ERR);
  }
});

test("BarcodeDetector.detect() rejects on an VideoFrame", async () => {
  const canvas = document.createElement("canvas");
  const frame = new VideoFrame(canvas, { timestamp: 0 });
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(frame);
    assert.fail("empty frame should trigger a detection error");
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.NOT_SUPPORTED_ERR);
  }
});

test("Barcode - detect(ImageData), [SameObject]", async () => {
  const image = await getHtmlImage();
  const canvas = drawImageToCanvas(image, {
    canvas: document.createElement("canvas"),
  });
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(
    canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height)!
  );
  assert.isAbove(detectionResult.length, 0);
  assert.equal(detectionResult[0].rawValue, detectionResult[0].rawValue);
  assert.equal(detectionResult[0].boundingBox, detectionResult[0].boundingBox);
  assert.equal(detectionResult[0].format, detectionResult[0].format);
  assert.equal(
    detectionResult[0].cornerPoints,
    detectionResult[0].cornerPoints
  );
});

test("BarcodeDetector.detect() rejects on a cross-origin HTMLImageElement", async () => {
  const image = await getHtmlImage(
    "http://localhost:18080/resources/cats-dogs.png"
  );
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(image);
    assert.fail(
      "cross-origin HTMLImageElement should trigger a detection error"
    );
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.SECURITY_ERR);
  }
});

test("BarcodeDetector.detect() rejects on a cross-origin ImageBitmap", async () => {
  const image = await getHtmlImage(
    "http://localhost:18080/resources/cats-dogs.png"
  );
  const imageBitmap = await createImageBitmap(image);
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(imageBitmap);
    assert.fail("cross-origin ImageBitmap should trigger a detection error");
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.SECURITY_ERR);
  }
});

test("BarcodeDetector.detect() rejects on a cross-origin HTMLVideoElement", async () => {
  const video = await getVideo(
    "http://localhost:18080/resources/cats-dogs.webm"
  );
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(video);
    assert.fail(
      "cross-origin HTMLVideoElement should trigger a detection error"
    );
  } catch (e) {
    assert.instanceOf(e, DOMException);
    assert.equal(e?.code, DOMException.SECURITY_ERR);
  }
});
