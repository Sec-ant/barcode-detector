import { DEFAULT_IMAGE_URL } from "../consts";

export async function getBlob(src = DEFAULT_IMAGE_URL) {
  return fetch(src).then((resp) => resp.blob());
}
