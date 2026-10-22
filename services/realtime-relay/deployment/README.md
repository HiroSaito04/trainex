# TRAINEX realtime-relay deployment

Run this as a long-running Node.js service (e.g. a dedicated VM, container host, or a WebSocket-capable PaaS), NOT as a Vercel serverless function. The Vercel-hosted UI establishes an outbound `wss://` connection.

1. Set `RELAY_ALLOWED_ORIGINS` to the exact deployed Vercel origin(s).
2. Set `RELAY_BROWSER_TOKENS` and `RELAY_DEVICES_JSON` via deployment secrets management. Tokens should be long, random, unique and rotated. Do not commit `.env` or ESP32 `Secrets.h`.
3. Expose the Node HTTP service through a TLS-terminating reverse proxy. The public route is `wss://relay.example.com/ws`. The relay itself listens on plain HTTP behind the trusted proxy, not on the public Internet.
4. Ensure reverse proxy forwards the WebSocket Upgrade and Connection headers; use active health checks `/health`.
5. Have a secure authenticated service issue short-lived browser tokens; **this demo uses a configured bearer-token allowlist and does not implement issuance/expiry. Do not embed the bearer token in a Vite build**, localStorage, or a public frontend bundle.
6. There is no horizontally distributed pairing registry. Run ONE relay instance until you add shared persistence and coordination.
7. This prototype pair code authenticates pairing to a device but the browser's claimed `sessionId` is not cryptographically bound to your website identity. Production security requires auth integration and backend session authorization.

Check that firmware trusts the relay's TLS certificate (see WiFiManager/WebSocketClient) and that WebSocket traffic never downgrades to ws:// over the Internet.
