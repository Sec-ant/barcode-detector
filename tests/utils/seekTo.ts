async function waitForNFrames(count: number) {
  if (count <= 0) {
    return Promise.reject(new TypeError("count should be greater than 0!"));
  }

  return await new Promise<void>((resolve) => {
    let c = count;
    function tick() {
      --c ? requestAnimationFrame(tick) : resolve();
    }
    requestAnimationFrame(tick);
  });
}

export async function seekTo(video: HTMLVideoElement, time: number) {
  return await new Promise<void>((resolve) => {
    video.addEventListener(
      "seeked",
      async () => {
        await waitForNFrames(3);
        resolve();
      },
      { once: true },
    );
    video.currentTime = time;
  });
}
