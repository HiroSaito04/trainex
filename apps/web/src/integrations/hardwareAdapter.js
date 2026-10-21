import { forwardHardwareInput } from "./inputAdapter.js";
import { getTrainexSnapshot } from "./trainexClient.js";

let socket = null;
let sequence = -1;
let hardware = Object.freeze({
  status: "disconnected",
  deviceId: null,
  error: null,
  method: null,
  lastMessage: null,
});

const listeners = new Set();
export const getHardwareSnapshot = () => hardware;
export function subscribeHardware(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(patch) {
  hardware = Object.freeze({ ...hardware, ...patch });
  for (const listener of listeners) listener();
}

export function disconnectHardware() {
  const previous = socket;
  socket = null;
  sequence = -1;
  previous?.close();
  update({
    status: "disconnected", deviceId: null, method: null,
    error: null, lastMessage: null,
  });
}

// WSS pairing requires a separately deployed relay that authenticates BOTH
// the browser and the ESP32 and authorizes their association with the session.
export function connectHardware({ endpoint, sessionId, pairingCode }) {
  if (typeof endpoint !== "string" || !endpoint.trim().startsWith("wss://")) {
    throw new Error("A secure wss:// relay endpoint is required.");
  }
  if (typeof sessionId !== "string" || !sessionId.trim() ||
      typeof pairingCode !== "string" || !pairingCode.trim()) {
    throw new Error("Session ID and pairing code are required.");
  }
  if (getTrainexSnapshot().sessionId !== sessionId.trim()) {
    throw new Error("Pairing must target the current simulation session.");
  }

  disconnectHardware();
  const ws = new WebSocket(endpoint.trim());
  socket = ws;
  const pairedSession = sessionId.trim();
  update({ status: "connecting", method: "websocket", error: null });

  ws.onopen = () => {
    if (socket !== ws) return;
    ws.send(JSON.stringify({
      type: "pair", protocolVersion: 1, role: "web",
      sessionId: pairedSession, pairingCode: pairingCode.trim(),
    }));
  };

  ws.onmessage = (event) => {
    if (socket !== ws) return;
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      update({ error: "Received malformed relay data." });
      return;
    }
    if (!message || typeof message !== "object") return;

    if (message.type === "paired" && message.sessionId === pairedSession) {
      if (typeof message.deviceId !== "string" || !message.deviceId.trim()) {
        update({ error: "Relay did not provide a valid paired device ID." });
        ws.close();
        return;
      }
      sequence = -1;
      update({ status: "connected", deviceId: message.deviceId, error: null });
      return;
    }

    if (message.type === "pair-error") {
      update({ status: "error", error: message.message || "Pairing rejected." });
      ws.close();
      return;
    }

    if (message.type !== "input" || hardware.status !== "connected") return;
    if (getTrainexSnapshot().sessionId !== pairedSession) {
      update({ error: "Simulation session changed. Hardware disconnected." });
      ws.close();
      return;
    }
    if (message.sessionId !== pairedSession || message.deviceId !== hardware.deviceId) return;
    if (!Number.isSafeInteger(message.sequence) || message.sequence < 0 || message.sequence <= sequence) return;
    sequence = message.sequence;
    update({ lastMessage: String(message.controlId ?? message.control ?? "—") });
    Promise.resolve(forwardHardwareInput(message))
      .then((result) => {
        if (socket === ws && result?.accepted !== true) {
          update({ error: result?.reason ?? "Hardware command was rejected." });
        }
      })
      .catch((error) => {
        if (socket === ws) update({ error: error?.message ?? "Hardware input failed." });
      });
  };

  ws.onerror = () => {
    if (socket === ws) update({ status: "error", error: "Relay connection failed." });
  };
  ws.onclose = () => {
    if (socket !== ws) return;
    socket = null;
    sequence = -1;
    update({ status: "disconnected", deviceId: null, method: null });
  };
}
