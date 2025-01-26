import { DEFAULT_IMAGE_URL } from "../consts";
import { getBlob } from "./getBlob";

export async function getImageBitmap(src = DEFAULT_IMAGE_URL) {
  const blob = await getBlob(src);
  return await createImageBitmap(blob);
}
