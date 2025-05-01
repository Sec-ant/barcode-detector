import { BarcodeDetector } from "./src/ponyfill";

const barcodeDetector = new BarcodeDetector({
  formats: ["qr_code"],
});

barcodeDetector.detect(document.querySelector("img")!).then(console.log);
