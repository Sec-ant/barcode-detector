/// <reference types="vite/client" />

import { test, assert, expect } from "vitest";
import "../src/index";

async function getImage(
  src = new URL("./resources/cats-dogs.png", import.meta.url).href
) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", (error) => {
      reject([error, img] as const);
    });
    img.src = src;
  });
}

async function getVideo(
  src = new URL("./resources/cats-dogs.webm", import.meta.url).href
) {
  return await new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement("video");
    video.addEventListener("canplay", () => {
      video.play();
      video.currentTime = 0;
    });
    video.addEventListener("seeked", () => {
      resolve(video);
    });
    video.addEventListener("error", (error) => {
      reject([error, video] as const);
    });
    video.src = src;
    video.loop = true;
    video.muted = true;
    video.load();
  });
}

function areCatsAndDogs(detectionResult: DetectedBarcode[]) {
  assert.equal(detectionResult.length, 2, "Number of barcodes");
  assert.equal(detectionResult[0].rawValue, "cats", "barcode 1");
  assert.equal(detectionResult[0].format, "qr_code", "barcode 1 format");
  assert.equal(detectionResult[1].rawValue, "dogs", "barcode 2");
  assert.equal(detectionResult[1].format, "code_128", "barcode 2 format");
}

function drawImageToCanvas(
  img: HTMLImageElement,
  {
    createCanvas = () => document.createElement("canvas"),
    pixelFormat,
  }: {
    createCanvas: () => HTMLCanvasElement | OffscreenCanvas;
    pixelFormat?: string;
  } = {
    createCanvas: () => document.createElement("canvas"),
  }
) {
  const canvas = createCanvas();
  canvas.width = img.width;
  canvas.height = img.height;
  (
    canvas.getContext("2d", {
      pixelFormat,
    }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ).drawImage(img, 0, 0, img.width, img.height);
  return canvas;
}

test("detectedBarcode.boundingBox should be DOMRectReadOnly", async () => {
  const img = await getImage();

  const canvas = drawImageToCanvas(img);

  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(
    canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height)!
  );

  detectionResult.forEach(({ boundingBox }) => {
    assert.isTrue(boundingBox instanceof DOMRectReadOnly);
  });
});

test("detectedBarcode can be passed to postMessage()", async () => {
  const img = await getImage();

  const canvas = drawImageToCanvas(img);

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
    const img = await getImage();
    const canvas = drawImageToCanvas(img, {
      createCanvas,
      pixelFormat,
    });
    const barcodeDetector = new BarcodeDetector();
    const detectionResult = await barcodeDetector.detect(canvas);
    areCatsAndDogs(detectionResult);
  });
});

test("detect(empty src)", async () => {
  try {
    await getImage("");
    assert.fail("empty src img should not resolve");
  } catch ([_, img]) {
    const barcodeDetector = new BarcodeDetector();
    try {
      await barcodeDetector.detect(img);
      assert.fail("empty src img should trigger a detection error");
    } catch (e) {
      assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
    }
  }
});

test("detect(0x0)", async () => {
  const img = await getImage(
    new URL("./resources/red-zerosize.svg", import.meta.url).href
  );
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(img);
  assert.isEmpty(detectionResult);
});

test("detect(HTMLImageElement)", async () => {
  const img = await getImage();
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(img);
  areCatsAndDogs(detectionResult);
});

test("detect(HTMLVideoElement)", async () => {
  const video = await getVideo();
  const barcodeDetector = new BarcodeDetector();
  const detectionResult = await barcodeDetector.detect(video);
  areCatsAndDogs(detectionResult);
});

test("BarcodeDetector.detect() rejects on a closed ImageBitmap", async () => {
  const img = await getImage();
  const imageBitmap = await createImageBitmap(img);
  imageBitmap.close();
  const barcodeDetector = new BarcodeDetector();
  try {
    await barcodeDetector.detect(imageBitmap);
    assert.fail("closed ImageBitmap should trigger a detection error");
  } catch (e) {
    assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
  }
});

test("detect(ImageBitmap)", async () => {
  const img = await getImage();
  const imageBitmap = await createImageBitmap(img);
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
    console.log(e);
    assert.equal(e?.code, DOMException.INVALID_STATE_ERR);
  }
});

test("detect(ImageData)", async () => {
  const img = await getImage();
  const canvas = drawImageToCanvas(img);

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
