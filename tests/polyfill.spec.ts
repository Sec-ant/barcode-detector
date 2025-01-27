import { assert, afterEach, beforeEach, describe, test } from "vitest";

describe("Polyfill doesn't take effect on existing non-nullable implementations", () => {
  let originalImplementation: unknown;
  beforeEach(() => {
    originalImplementation = globalThis.BarcodeDetector;
  });
  afterEach(() => {
    globalThis.BarcodeDetector = originalImplementation;
  });
  test("existing string type implementation", async () => {
    const placeholder = "";
    globalThis.BarcodeDetector = placeholder;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing number type implementation", async () => {
    const placeholder = 0;
    globalThis.BarcodeDetector = placeholder;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing boolean type implementation", async () => {
    const placeholder = false;
    globalThis.BarcodeDetector = placeholder;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing document.all type implementation", async () => {
    const placeholder = document.all;
    globalThis.BarcodeDetector = placeholder;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing object type implementation", async () => {
    const placeholder = Object.create(null);
    globalThis.BarcodeDetector = placeholder;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing function type implementation", async () => {
    const placeholder = () => {};
    globalThis.BarcodeDetector = placeholder;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
});

describe("Polyfill takes effect on nullable implementations", () => {
  let originalImplementation: unknown;
  beforeEach(() => {
    originalImplementation = globalThis.BarcodeDetector;
  });
  afterEach(() => {
    globalThis.BarcodeDetector = originalImplementation;
  });
  test("existing implementation is deleted", async () => {
    // biome-ignore lint/performance/noDelete: for testing
    delete globalThis.BarcodeDetector;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.instanceOf(globalThis.BarcodeDetector, Function);
  });
  test("existing implementation is undefined", async () => {
    globalThis.BarcodeDetector = undefined;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.instanceOf(globalThis.BarcodeDetector, Function);
  });
  test("existing implementation is null", async () => {
    globalThis.BarcodeDetector = null;
    const modulePath = `../src/polyfill?update=${Date.now()}}`;
    await import(modulePath);
    assert.instanceOf(globalThis.BarcodeDetector, Function);
  });
});
