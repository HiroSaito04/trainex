# Deploy the TRAINEX relay separately from Vercel

The Vercel website remains the frontend. The relay must run as a persistent WebSocket Node.js service (e.g., Railway), not as an ordinary short-lived serverless handler.

1. Push `services/realtime-relay/` files to your TRAINEX GitHub repository.
2. Create a Railway service from the same repository. Choose the repository root as build context if `@trainex/contracts` is in the npm workspaces. In Railway, set the **Root Directory** to the repository root, not `services/realtime-relay`, when workspace links are needed.
3. Set build command `npm ci` and start command `npm run start --workspace=@trainex/realtime-relay`.
4. Configure Railway Variables (never GitHub):
   - `RELAY_ALLOWED_ORIGINS=https://trainex-six.vercel.app`
   - `RELAY_ALLOW_PAIR_CODE_BROWSER_AUTH=true` for supervised prototype only.
   - `RELAY_DEVICES_JSON={"trainex-esp32-01":{"token":"<long-random-token>","pairingCode":"<long-random-code>"}}`
   - `RELAY_HEARTBEAT_TIMEOUT_MS=90000`.
   - `PORT` is supplied by Railway; server accepts `PORT` or `RELAY_PORT`.
5. Enable a public HTTPS service domain. Health endpoint: `https://<hostname>/health` should return `{"status":"ok"}`. WebSocket endpoint: `wss://<hostname>/ws`.
6. Configure `hardware/esp32/include/Secrets.h` with `RELAY_HOST` as `<hostname>`, and `RELAY_DEVICE_TOKEN` equal to the server's device token. Paste correct Wi-Fi credentials. Check the CA certificate matches your HTTPS domain chain before uploading firmware.
7. The ESP32 should authenticate in VS Code's PlatformIO Serial Monitor. Open the deployed TRAINEX website, begin a simulator session and connect with the new public WSS endpoint, the real session ID and matching device pairing code.

Check this project's `integration-examples/browser-relay-client` if your deployed UI's existing WebSocket implementation sends a different handshake. The uploaded ZIP contains only `services/`, so `apps/web` wasn't patched.

**Hardening required before unrestricted public use:** backend authorization of real simulator session ownership; per-session short-lived browser access; device key rotation; rate limits at the reverse proxy; audit logging; shared registry for multi-instance deployment. The prototype code is not a verified production security solution.
