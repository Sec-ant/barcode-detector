export function drawImageToCanvas<
  T extends HTMLCanvasElement | OffscreenCanvas,
>(image: HTMLImageElement, canvas: T): T {
  canvas.width = image.width;
  canvas.height = image.height;
  (
    canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
  ).drawImage(image, 0, 0, image.width, image.height);
  return canvas;
}
