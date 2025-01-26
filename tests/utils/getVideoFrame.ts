import { DEFAULT_IMAGE_URL } from "../consts";
import { getImageBitmap } from "./getImageBitmap";

export async function getVideoFrame(src = DEFAULT_IMAGE_URL) {
  const imageBitmap = await getImageBitmap(src);
  return new VideoFrame(imageBitmap, { timestamp: 0 });
}
