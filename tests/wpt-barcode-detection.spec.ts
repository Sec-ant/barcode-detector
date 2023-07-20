import { test, assert, describe } from "vitest";
import "../src/side-effects";
import {
  getHTMLImage,
  getSVGImage,
  getVideo,
  drawImageToCanvas,
  seekTo,
} from "./helpers";

interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface CornerPoints {
  topLeft: {
    position: {
      x: number;
      y: number;
    };
    fuzzinessX: number;
    fuzzinessY: number;
  };
  topRight: {
    position: {
      x: number;
      y: number;
    };
    fuzzinessX: number;
    fuzzinessY: number;
  };
  bottomRight: {
    position: {
      x: number;
      y: number;
    };
    fuzzinessX: number;
    fuzzinessY: number;
  };
  bottomLeft: {
    position: {
      x: number;
      y: number;
    };
    fuzzinessX: number;
    fuzzinessY: number;
  };
}

interface ImageTest {
  name: string;
  format: BarcodeFormat;
  payload: string;
  barcode: {
    boundingBox: BoundingBox;
    fuzziness: number;
  };
  cornerPoints: CornerPoints;
}

interface ImageTests {
  [k: string]: ImageTest;
}

const FUZZINESS_LARGE = 15;
const FUZZINESS_SMALL = 5;
const FUZZINESS_X = FUZZINESS_LARGE;
const FUZZINESS_Y = FUZZINESS_LARGE;

const imageTests: ImageTests = {
  aztecCorrection: {
    name: "aztec-correction.jpg",
    format: "aztec",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 240, right: 559, top: 144, bottom: 454 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 240, y: 144 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 559, y: 144 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 559, y: 454 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 240, y: 454 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  aztecFull: {
    name: "aztec-full.jpg",
    format: "aztec",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 281, right: 518, top: 184, bottom: 414 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 281, y: 184 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 518, y: 184 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 518, y: 414 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 281, y: 414 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  aztecLayers: {
    name: "aztec-layers.jpg",
    format: "aztec",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 175, right: 625, top: 75, bottom: 525 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 175, y: 75 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 625, y: 75 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 625, y: 525 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 175, y: 525 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  aztec: {
    name: "aztec.jpg",
    format: "aztec",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 302, right: 497, top: 202, bottom: 397 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 302, y: 202 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 497, y: 202 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 497, y: 397 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 302, y: 397 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  code128Height: {
    name: "code128-height.jpg",
    format: "code_128",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 90, right: 711, top: 149, bottom: 449 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 90, y: 149 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 711, y: 149 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 711, y: 450 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 90, y: 450 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  code128: {
    name: "code128.jpg",
    format: "code_128",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 90, right: 710, top: 267, bottom: 332 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 90, y: 267 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 710, y: 267 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 710, y: 332 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 90, y: 332 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Columns: {
    name: "pdf417-columns.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 39, right: 755, top: 243, bottom: 356 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 39, y: 243 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 755, y: 243 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 755, y: 356 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 39, y: 356 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Compact: {
    name: "pdf417-compact.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 186, right: 786, top: 242, bottom: 359 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 186, y: 242 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 786, y: 242 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 786, y: 359 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 186, y: 359 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Compaction: {
    name: "pdf417-compaction.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 84, right: 712, top: 217, bottom: 382 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 84, y: 217 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 712, y: 217 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 712, y: 382 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 84, y: 382 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Correction: {
    name: "pdf417-correction.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 39, right: 755, top: 209, bottom: 390 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 39, y: 209 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 755, y: 209 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 755, y: 390 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 39, y: 390 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Rows: {
    name: "pdf417-rows.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 84, right: 712, top: 227, bottom: 360 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 84, y: 227 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 712, y: 227 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 712, y: 360 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 84, y: 360 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Square: {
    name: "pdf417-square.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 170, right: 621, top: 119, bottom: 480 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 171, y: 119 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 621, y: 119 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 621, y: 480 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 170, y: 480 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Taller: {
    name: "pdf417-taller.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 84, right: 713, top: 209, bottom: 390 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 84, y: 209 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 713, y: 209 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 713, y: 390 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 84, y: 390 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417Wider: {
    name: "pdf417-wider.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 84, right: 712, top: 227, bottom: 360 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 84, y: 227 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 712, y: 227 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 712, y: 360 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 84, y: 360 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  pdf417: {
    name: "pdf417.jpg",
    format: "pdf417",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 126, right: 666, top: 209, bottom: 390 },
      fuzziness: FUZZINESS_LARGE,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 126, y: 209 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 666, y: 209 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 666, y: 390 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 126, y: 390 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrBottomLeft: {
    name: "qr-bottom-left.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 75, right: 325, top: 325, bottom: 575 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 75, y: 325 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 325, y: 325 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 325, y: 575 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 75, y: 575 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrBottomRight: {
    name: "qr-bottom-right.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 475, right: 725, top: 325, bottom: 575 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 475, y: 325 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 725, y: 325 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 725, y: 575 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 475, y: 575 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrCenter: {
    name: "qr-center.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 277, right: 524, top: 172, bottom: 428 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 277, y: 172 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 521, y: 172 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 524, y: 425 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 277, y: 428 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrH: {
    name: "qr-h.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 235, right: 565, top: 135, bottom: 465 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 235, y: 135 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 565, y: 135 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 565, y: 465 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 235, y: 465 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrL: {
    name: "qr-l.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 275, right: 525, top: 175, bottom: 425 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 275, y: 175 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 525, y: 175 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 525, y: 425 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 275, y: 425 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrM: {
    name: "qr-m.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 277, right: 524, top: 172, bottom: 428 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 277, y: 172 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 521, y: 172 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 524, y: 425 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 277, y: 428 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrQ: {
    name: "qr-q.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 252, right: 548, top: 157, bottom: 444 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 252, y: 157 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 548, y: 157 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 545, y: 444 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 252, y: 441 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrTopLeft: {
    name: "qr-top-left.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 75, right: 325, top: 25, bottom: 275 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 75, y: 25 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 325, y: 25 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 325, y: 275 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 75, y: 275 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
  qrTopRight: {
    name: "qr-top-right.jpg",
    format: "qr_code",
    payload: "Barcode Detection is Fun!",
    barcode: {
      boundingBox: { left: 475, right: 725, top: 25, bottom: 275 },
      fuzziness: FUZZINESS_SMALL,
    },
    cornerPoints: {
      topLeft: {
        position: { x: 475, y: 25 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      topRight: {
        position: { x: 725, y: 25 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomRight: {
        position: { x: 725, y: 275 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
      bottomLeft: {
        position: { x: 475, y: 275 },
        fuzzinessX: FUZZINESS_X,
        fuzzinessY: FUZZINESS_Y,
      },
    },
  },
};

const videoTests = {
  "barcodes.webm": [
    { time: 0.5, test: imageTests.aztecCorrection },
    { time: 1.5, test: imageTests.aztecFull },
    { time: 2.5, test: imageTests.aztecLayers },
    { time: 3.5, test: imageTests.aztec },
    { time: 4.5, test: imageTests.code128Height },
    { time: 5.5, test: imageTests.code128 },
    { time: 6.5, test: imageTests.pdf417Columns },
    { time: 7.5, test: imageTests.pdf417Compact },
    { time: 8.5, test: imageTests.pdf417Compaction },
    { time: 9.5, test: imageTests.pdf417Correction },
    { time: 10.5, test: imageTests.pdf417Rows },
    { time: 11.5, test: imageTests.pdf417Square },
    { time: 12.5, test: imageTests.pdf417Taller },
    { time: 13.5, test: imageTests.pdf417Wider },
    { time: 14.5, test: imageTests.pdf417 },
    { time: 15.5, test: imageTests.qrBottomLeft },
    { time: 16.5, test: imageTests.qrBottomRight },
    { time: 17.5, test: imageTests.qrCenter },
    { time: 18.5, test: imageTests.qrH },
    { time: 19.5, test: imageTests.qrL },
    { time: 20.5, test: imageTests.qrM },
    { time: 21.5, test: imageTests.qrQ },
    { time: 22.5, test: imageTests.qrTopLeft },
    { time: 23.5, test: imageTests.qrTopRight },
  ],
};

// All the fields in FaceDetectorOptions are hints, so they can't be tested.
const barcodeDetector = new BarcodeDetector();

async function testImage(
  imageBitmapSource: ImageBitmapSourceWebCodecs,
  test: ImageTest,
  key: string
) {
  const supportedFormats = await BarcodeDetector.getSupportedFormats();
  if (!supportedFormats.includes(test.format)) return;
  const detectedBarcodes = await barcodeDetector.detect(imageBitmapSource);
  assert.equal(detectedBarcodes.length, 1);
  const detectedBarcode = detectedBarcodes[0];
  checkBoundingBox(
    detectedBarcode.boundingBox,
    test.barcode.boundingBox,
    test.barcode.fuzziness,
    key
  );
  assert.equal(detectedBarcode.rawValue, test.payload);
  assert.equal(detectedBarcode.format, test.format);
  assert.equal(detectedBarcode.cornerPoints.length, 4);
  checkCornerPoints(detectedBarcode.cornerPoints, test.cornerPoints, key);
}

function checkBoundingBox(
  actual: DOMRectReadOnly,
  expected: BoundingBox,
  fuzziness: number,
  key: string
) {
  assert.instanceOf(actual, DOMRectReadOnly);
  assert.approximately(
    actual.left,
    expected.left,
    fuzziness,
    `${key} bounding box left position deviated by ${
      actual.left - expected.left
    }`
  );
  assert.approximately(
    actual.right,
    expected.right,
    fuzziness,
    `${key} bounding box right position deviated by ${
      actual.left - expected.left
    }`
  );
  assert.approximately(
    actual.top,
    expected.top,
    fuzziness,
    `${key} bounding box top position deviated by ${
      actual.left - expected.left
    }`
  );
  assert.approximately(
    actual.bottom,
    expected.bottom,
    fuzziness,
    `${key} bounding box bottom position deviated by ${
      actual.left - expected.left
    }`
  );
}

function checkCornerPoints(
  actualCornerPoints: DetectedBarcode["cornerPoints"],
  expectedCornerPoints: CornerPoints,
  key: string
) {
  const corners = ["topLeft", "topRight", "bottomRight", "bottomLeft"];

  for (let i = 0; i < corners.length; ++i) {
    const corner = corners[i];
    const {
      position: expected,
      fuzzinessX,
      fuzzinessY,
    } = expectedCornerPoints[corner];
    const actual = actualCornerPoints[i];
    assert.approximately(
      actual.x,
      expected.x,
      fuzzinessX,
      `${key} ${corner} corner point position x deviated by ${
        actual.x - expected.x
      }`
    );
    assert.approximately(
      actual.y,
      expected.y,
      fuzzinessY,
      `${key} ${corner} corner point position y deviated by ${
        actual.y - expected.y
      }`
    );
  }
}

describe("HTMLImageElement tests", () => {
  for (const [key, imageTest] of Object.entries(imageTests)) {
    test(`${key} HTMLImageElement`, async () => {
      const image = await getHTMLImage(
        new URL(`./resources/${imageTest.name}`, import.meta.url).href
      );
      await testImage(image, imageTest, key);
    });
  }
});

describe("SVGImageElement tests", () => {
  for (const [key, imageTest] of Object.entries(imageTests)) {
    test(`${key} HTMLImageElement`, async () => {
      const image = await getSVGImage(
        new URL(`./resources/${imageTest.name}`, import.meta.url).href
      );
      await testImage(image, imageTest, key);
    });
  }
});

describe("HTMLCanvasElement tests", () => {
  for (const [key, imageTest] of Object.entries(imageTests)) {
    test(`${key} HTMLCanvasElement`, async () => {
      const image = await getHTMLImage(
        new URL(`./resources/${imageTest.name}`, import.meta.url).href
      );
      const canvas = drawImageToCanvas(image, {
        canvas: document.createElement("canvas"),
      });
      await testImage(canvas, imageTest, key);
    });
  }
});

describe("ImageBitmap tests", () => {
  for (const [key, imageTest] of Object.entries(imageTests)) {
    test(`${key} ImageBitmap`, async () => {
      const image = await getHTMLImage(
        new URL(`./resources/${imageTest.name}`, import.meta.url).href
      );
      const imageBitmap = await createImageBitmap(image);
      await testImage(imageBitmap, imageTest, key);
    });
  }
});

describe("OffscreenCanvas tests", () => {
  for (const [key, imageTest] of Object.entries(imageTests)) {
    test(`${key} OffscreenCanvas`, async () => {
      const image = await getHTMLImage(
        new URL(`./resources/${imageTest.name}`, import.meta.url).href
      );
      const canvas = await drawImageToCanvas(image, {
        canvas: new OffscreenCanvas(image.width, image.height),
      });
      await testImage(canvas, imageTest, key);
    });
  }
});

describe("Blob tests", () => {
  for (const [key, imageTest] of Object.entries(imageTests)) {
    test(`${key} Blob`, async () => {
      const image = await getHTMLImage(
        new URL(`./resources/${imageTest.name}`, import.meta.url).href
      );
      const canvas = drawImageToCanvas(image, {
        canvas: document.createElement("canvas"),
      });
      const blob = (await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => {
          resolve(blob);
        })
      ))!;
      assert.isNotNull(blob);
      await testImage(blob, imageTest, key);
    });
  }
});

describe("ImageData tests", () => {
  for (const [key, imageTest] of Object.entries(imageTests)) {
    test(`${key} ImageData`, async () => {
      const image = await getHTMLImage(
        new URL(`./resources/${imageTest.name}`, import.meta.url).href
      );
      const canvas = drawImageToCanvas(image, {
        canvas: document.createElement("canvas"),
      });
      const context = canvas.getContext("2d");
      const imageData = context?.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      )!;
      assert.isDefined(imageData);
      await testImage(imageData, imageTest, key);
    });
  }
});

describe("HTMLVideoElement tests", () => {
  for (const [name, videoTest] of Object.entries(videoTests)) {
    describe(`${name} HTMLVideoElement`, async () => {
      const video = await getVideo(
        new URL(`./resources/${name}`, import.meta.url).href
      );
      for (const videoTestPoint of videoTest) {
        test(`${videoTestPoint.test.name} HTMLVideoElement at ${name} ${videoTestPoint.time}`, async () => {
          await seekTo(video, videoTestPoint.time);
          await testImage(video, videoTestPoint.test, name);
        });
      }
    });
  }
});

describe("VideoFrame tests", () => {
  for (const [name, videoTest] of Object.entries(videoTests)) {
    describe(`${name} VideoFrame`, async () => {
      const video = await getVideo(
        new URL(`./resources/${name}`, import.meta.url).href
      );
      for (const videoTestPoint of videoTest) {
        test(`${videoTestPoint.test.name} HTMLVideoElement at ${name} ${videoTestPoint.time}`, async () => {
          await seekTo(video, videoTestPoint.time);
          const videoFrame = new VideoFrame(video);
          await testImage(videoFrame, videoTestPoint.test, name);
          videoFrame.close();
        });
      }
    });
  }
});
