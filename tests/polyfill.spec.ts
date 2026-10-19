import { afterEach, assert, describe, test, vi } from "vitest";

let update = 0;
afterEach(() => vi.unstubAllGlobals());

describe("Polyfill doesn't take effect on existing non-nullable implementations", () => {
  test("existing string type implementation", async () => {
    const placeholder = "";
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing number (0) type implementation", async () => {
    const placeholder = 0;
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing number (NaN) type implementation", async () => {
    const placeholder = Number.NaN;
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing boolean type implementation", async () => {
    const placeholder = false;
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing document.all type implementation", async () => {
    const placeholder = document.all;
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing object type implementation", async () => {
    const placeholder = Object.create(null);
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing array type implementation", async () => {
    const placeholder: unknown[] = [];
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
  test("existing function type implementation", async () => {
    const placeholder = () => {};
    vi.stubGlobal("BarcodeDetector", placeholder);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.isTrue(Object.is(globalThis.BarcodeDetector, placeholder));
  });
});

describe("Polyfill takes effect on nullable implementations", () => {
  test("existing implementation is deleted", async () => {
    vi.stubGlobal("BarcodeDetector", undefined);
    Reflect.deleteProperty(globalThis, "BarcodeDetector");
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.instanceOf(globalThis.BarcodeDetector, Function);
  });
  test("existing implementation is undefined", async () => {
    vi.stubGlobal("BarcodeDetector", undefined);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.instanceOf(globalThis.BarcodeDetector, Function);
  });
  test("existing implementation is null", async () => {
    vi.stubGlobal("BarcodeDetector", null);
    await import(/* @vite-ignore */ `../src/polyfill?update=${update++}`);
    assert.instanceOf(globalThis.BarcodeDetector, Function);
  });
});
