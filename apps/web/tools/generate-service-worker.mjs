/**
 * TRAINEX PWA offline precache generator.
 * Runs after Vite has produced dist/ so the list includes the actual hashed JS,
 * CSS, SVG, GLB cabin, textures, local lesson assets, and app icons.
 * No extra dependencies or changes to the simulator architecture are needed.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(webDir, "dist");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(file)));
    else if (
      entry.isFile() &&
      !entry.name.startsWith(".") &&
      entry.name !== "sw.js" &&
      !entry.name.endsWith(".map")
    ) {
      files.push(file);
    }
  }
  return files;
}

const files = (await walk(distDir)).sort();
const cacheUrls = [
  "/",
  ...files.map(
    (file) => "/" + path.relative(distDir, file).split(path.sep).join("/"),
  ),
];
const fingerprint = createHash("sha256");
for (const file of files) {
  fingerprint.update(path.relative(distDir, file));
  fingerprint.update(await readFile(file));
}
const revision = fingerprint.digest("hex").slice(0, 16);

const serviceWorker = `/* Generated automatically by tools/generate-service-worker.mjs. */
const CACHE_NAME = "trainex-precache-${revision}-svg-navigation-v2";
const CACHE_PREFIX = "trainex-precache-";
const PRECACHE_URLS = ${JSON.stringify(cacheUrls, null, 2)};
const PRECACHE_PATHS = new Set(PRECACHE_URLS);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Only mark the new service worker installed after all local assets are cached.
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === "/sw.js") return;

  // Important: <object data="...svg"> may be requested as a document NAVIGATION.
  // An SVG asset must be served from its own cache entry, not replaced by the
  // index.html SPA fallback. Handle ALL known static resources first.
  if (PRECACHE_PATHS.has(url.pathname) && url.pathname !== "/" && url.pathname !== "/index.html") {
    event.respondWith((async () => {
      const cached = await caches.match(url.pathname);
      return cached || fetch(request);
    })());
    return;
  }

  if (request.mode === "navigate") {
    // Navigation fallback applies to SPA pages only, never to cached SVG objects.
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch (error) {
        return await caches.match("/index.html") || await caches.match("/") ||
          new Response("TRAINEX is unavailable offline until its files have been saved.",
            { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }

  if (!PRECACHE_PATHS.has(url.pathname)) return;
  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    return fetch(request);
  })());
});
`;

await writeFile(path.join(distDir, "sw.js"), serviceWorker, "utf8");
console.log(
  `TRAINEX offline service worker: ${cacheUrls.length} paths precached (${revision}).`,
);
