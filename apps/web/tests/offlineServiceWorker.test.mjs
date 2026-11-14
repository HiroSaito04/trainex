/**
 * Regression tests for TRAINEX 2D SVG offline loads.
 * A browser is allowed to request <object data="...svg"> as a navigation.
 * It must receive SVG, not the React app's HTML navigation fallback.
 * Run: node --test apps/web/tests/offlineServiceWorker.test.mjs
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";

const here = path.dirname(fileURLToPath(import.meta.url));
const swScript = await readFile(path.join(here, "../dist/sw.js"), "utf8");
const bundledSvgPath = swScript.match(
  /"(\/assets\/TRAINEX-Driver-Cab-2D-[^"]+\.svg)"/,
)?.[1];
assert.ok(
  bundledSvgPath,
  "Built service worker must precache the bundled 2D SVG",
);
F
function makeOfflineServiceWorker() {
  const listeners = new Map();
  const cachedResponses = new Map([
    [
      "/index.html",
      new Response("<!doctype html><title>TRAINEX</title>", {
        headers: { "content-type": "text/html" },
      }),
    ],
    [
      "/",
      new Response("<!doctype html><title>TRAINEX</title>", {
        headers: { "content-type": "text/html" },
      }),
    ],
    [
      "/models/2d/trainex-driver-cab.svg",
      new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
        headers: { "content-type": "image/svg+xml" },
      }),
    ],
    [
      bundledSvgPath,
      new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
        headers: { "content-type": "image/svg+xml" },
      }),
    ],
    ["/models/cabin/trainex_cabin.glb", new Response("glb asset")],
  ]);
  let networkRequests = 0;
  const context = vm.createContext({
    URL,
    Response,
    Set,
    Promise,
    console,
    self: {
      location: { origin: "https://trainex.example" },
      addEventListener(name, callback) {
        listeners.set(name, callback);
      },
    },
    caches: {
      async match(key) {
        const pathname = new URL(
          typeof key === "string" ? key : key.url,
          "https://trainex.example",
        ).pathname;
        return cachedResponses.get(pathname)?.clone();
      },
    },
    async fetch() {
      networkRequests += 1;
      throw new TypeError("Offline");
    },
  });
  vm.runInContext(swScript, context, { filename: "dist/sw.js" });
  return {
    async request(pathname, mode = "navigate") {
      let responsePromise;
      listeners.get("fetch")({
        request: {
          method: "GET",
          url: `https://trainex.example${pathname}`,
          mode,
        },
        respondWith(promise) {
          responsePromise = promise;
        },
      });
      return responsePromise ? await responsePromise : null;
    },
    networkRequests: () => networkRequests,
  };
}

test("public 2D SVG loads offline even when browser requests it as a navigation", async () => {
  const sw = makeOfflineServiceWorker();
  const response = await sw.request("/models/2d/trainex-driver-cab.svg");
  assert.equal(response.headers.get("content-type"), "image/svg+xml");
  assert.match(await response.text(), /^<svg/);
  assert.equal(sw.networkRequests(), 0);
});

test("bundled 2D SVG fallback also loads offline as a navigation", async () => {
  const sw = makeOfflineServiceWorker();
  const response = await sw.request(bundledSvgPath);
  assert.equal(response.headers.get("content-type"), "image/svg+xml");
  assert.equal(sw.networkRequests(), 0);
});

test("2D web app route still falls back to index.html when offline", async () => {
  const sw = makeOfflineServiceWorker();
  const response = await sw.request("/simulators/2d");
  assert.match(await response.text(), /<!doctype html>/);
  assert.equal(sw.networkRequests(), 1);
});

test("3D model remains cache-first", async () => {
  const sw = makeOfflineServiceWorker();
  const response = await sw.request("/models/cabin/trainex_cabin.glb", "cors");
  assert.equal(await response.text(), "glb asset");
  assert.equal(sw.networkRequests(), 0);
});
