# TRAINEX favicon, mobile icon, and offline PWA

The same maroon, gold, and white TRAINEX train logo is installed as a browser
favicon, Apple touch icon, Android launcher icon, and adaptive maskable icon.

## Building and deploying

1. Copy this `apps/web` folder over `apps/web` in the full TRAINEX repository.
   Keep the existing `packages/` folder and root npm workspaces intact.
2. From the TRAINEX repository root, run `npm install` (if needed) and
   `npm run build --workspace=./apps/web`.
3. Deploy the resulting `apps/web/dist/` using the normal Vercel pipeline.
   Set the Vercel root directory to `apps/web` only if the install/build setup
   still has access to the root workspace packages.
4. The production build automatically creates `dist/sw.js`. It precaches the
   complete built website, including CSS, JS, icons, the 2D desk SVG, and the
   3D cabin GLB and textures. It does not require an extra PWA dependency.

## Testing offline

- Use a deployed HTTPS site or `npm run preview --workspace=./apps/web`
  locally (`localhost` supports service workers).
- Visit TRAINEX **online** and keep the tab open long enough for the service
  worker to install and cache all resources. The browser DevTools > Application
  > Service Workers / Cache Storage can confirm installation.
- Enable **Offline** in DevTools > Network, then reload `/`, `/learn`,
  `/simulators/2d`, and `/simulators/3d` directly.
- Note: `npm run dev` intentionally does NOT register an offline service worker.

## Mobile installation

- Android: open TRAINEX in Chrome, choose **Install app** / **Add to Home screen**.
- iPhone/iPad: open TRAINEX in Safari, choose **Share > Add to Home Screen**.
- Installability requires HTTPS in production (or localhost for development).

## Offline behavior and limits

- After the first completed cache, the TRAINEX UI and bundled local 2D/3D
  simulator assets can be loaded without network access. The simulation engine
  is browser-based and does not require a backend to calculate movement.
- Anything hosted outside this deployment (external documents, remote fonts,
  or live backend APIs) is NOT cached by this service worker.
- Live ESP32 Wi-Fi hardware pairing through the external WebSocket relay is NOT
  available without a compatible network connection.
- New deployments refresh the versioned cache automatically. An old cache can
  remain in use until the browser updates; refresh online to get updates.
- Browsers can evict caches under storage pressure, and clearing site data
  removes offline files. Offline operation is not guaranteed on every device.

## Modified source files

- `apps/web/index.html`
- `apps/web/src/main.jsx`
- `apps/web/public/manifest.webmanifest`
- `apps/web/public/favicon.ico` and six PNG icons
- `apps/web/package.json`
- `apps/web/vercel.json`
- `apps/web/tools/generate-service-worker.mjs`
