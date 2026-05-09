import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { config } from "../package.json";

const ROOT = resolve("tests");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

// Vitest invokes globalSetup once per project (one per browser instance),
// but they share the same Node process, so guard against double-listen.
let refs = 0;
let serverPromise: Promise<{ close: () => Promise<void> }> | null = null;

export default async function setup() {
  refs += 1;
  if (!serverPromise) {
    serverPromise = startServer();
  }
  const { close } = await serverPromise;
  return async () => {
    refs -= 1;
    if (refs === 0) {
      await close();
      serverPromise = null;
    }
  };
}

async function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const requested = join(ROOT, normalize(url.pathname));

    // Path traversal guard
    if (requested !== ROOT && !requested.startsWith(ROOT + sep)) {
      res.writeHead(403).end();
      return;
    }

    try {
      const stat = statSync(requested);
      if (stat.isDirectory()) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        "content-type": MIME[extname(requested)] ?? "application/octet-stream",
        "content-length": String(stat.size),
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
      });
      createReadStream(requested).pipe(res);
    } catch {
      res.writeHead(404).end();
    }
  });

  await new Promise<void>((r) =>
    server.listen(Number(config.port), "127.0.0.1", r),
  );

  return {
    close: () =>
      new Promise<void>((r) => {
        // Forcefully drop keep-alive connections (e.g. from the browser test
        // runner) so the Node process can exit promptly. Without this,
        // `server.close()` waits for idle on every open socket and stalls
        // until vitest's teardown timeout.
        server.closeAllConnections();
        server.close(() => r());
      }),
  };
}
