import { forwardHardwareInput } from "./inputAdapter.js";
import { getTrainexSnapshot, subscribeTrainex } from "./trainexClient.js";
import { UsbSerialConnection } from "./UsbSerialConnection.js";
import { parseTrainexUsbLine } from "./parseTrainexUsbLine.js";

let socket = null;
let usbConnection = null;
let usbSequence = 0;
let unsubscribeUsbSession = null;
let sequence = -1;
let heartbeatTimer = null;
let unsubscribeFeedback = null;
let lastFeedbackAt = 0;
let previousBuzzer = null;
function stopFeedback() {
  unsubscribeFeedback?.();
  unsubscribeFeedback = null;
  previousBuzzer = null;
  lastFeedbackAt = 0;
}

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

function stopHeartbeat() {
  if (heartbeatTimer !== null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

export function disconnectHardware() {
  const previous = socket;
  const previousUsb = usbConnection;
  socket = null;
  usbConnection = null;
  usbSequence = 0;
  sequence = -1;
  unsubscribeUsbSession?.();
  unsubscribeUsbSession = null;
  stopHeartbeat();
  stopFeedback();

  // Explicit disconnect: tell the relay to free the session when possible.
  if (previous) {
    if (previous.readyState === WebSocket.OPEN) {
      previous.send(JSON.stringify({ type: "unpair" }));
    }
    previous.close();
  }

  // Cancel the stream and release COM5 so PlatformIO can use it again.
  const serialCleanup = previousUsb?.disconnect() ?? Promise.resolve();
  update({
    status: "disconnected",
    deviceId: null,
    error: null,
    method: null,
    lastMessage: null,
  });
  return serialCleanup;
}

/**
 * Connect an ESP32 running the existing `esp32dev` BENCH firmware.
 * No reflash, Wi-Fi, pairing code, or relay required. The browser permission
 * picker MUST be invoked by a direct click on the Connect USB button.
 */
export async function connectUsbHardware() {
  const initialSessionId = getTrainexSnapshot().sessionId;
  if (!initialSessionId) {
    throw new Error(
      "Start a TRAINEX simulation session before connecting USB hardware.",
    );
  }
  if (hardware.status !== "disconnected" && hardware.status !== "error") {
    throw new Error("Disconnect the existing hardware connection first.");
  }
  if (
    !globalThis.isSecureContext ||
    !globalThis.navigator?.serial?.requestPort
  ) {
    throw new Error(
      "Use desktop Chrome or Edge on HTTPS (or localhost) to connect USB Serial.",
    );
  }
  if (hardware.status === "error") void disconnectHardware();
  const deviceId = "trainex-esp32-usb";
  let connection;
  const onLine = (line) => {
    if (usbConnection !== connection || hardware.status !== "connected") return;
    const input = parseTrainexUsbLine(line);
    if (!input) return; // Ignore boot logs, status lines, corrupt bytes, unknown commands.
    if (getTrainexSnapshot().sessionId !== initialSessionId) {
      void disconnectHardware();
      return;
    }
    const message = {
      source: "hardware",
      type: "input",
      deviceId,
      sessionId: initialSessionId,
      sequence: usbSequence++,
      ...input,
    };
    update({
      lastMessage: `${input.controlId}${typeof input.value === "string" ? ` ${input.value}` : ""}`,
      error: null,
    });
    Promise.resolve(forwardHardwareInput(message))
      .then((result) => {
        if (usbConnection === connection && result?.accepted !== true) {
          update({
            error:
              result?.reason ?? "The simulation rejected that button press.",
          });
        }
      })
      .catch((error) => {
        if (usbConnection === connection)
          update({ error: error?.message ?? "USB input failed." });
      });
  };
  const onClosed = (error) => {
    if (usbConnection !== connection) return;
    usbConnection = null;
    unsubscribeUsbSession?.();
    unsubscribeUsbSession = null;
    update({
      status: "disconnected",
      deviceId: null,
      method: null,
      error: error?.message ?? "USB disconnected.",
    });
  };
  connection = new UsbSerialConnection({ onLine, onClosed });
  usbConnection = connection;
  usbSequence = 0;
  update({
    status: "connecting",
    method: "usb-serial",
    deviceId: null,
    error: null,
    lastMessage: null,
  });
  try {
    // connect() immediately invokes navigator.serial.requestPort() under the click gesture.
    await connection.connect();
    if (usbConnection !== connection) return;
    if (getTrainexSnapshot().sessionId !== initialSessionId) {
      await disconnectHardware();
      throw new Error("Simulation session changed during USB connection.");
    }
    update({
      status: "connected",
      method: "usb-serial",
      deviceId,
      error: null,
    });
    unsubscribeUsbSession = subscribeTrainex(() => {
      if (
        usbConnection === connection &&
        getTrainexSnapshot().sessionId !== initialSessionId
      ) {
        void disconnectHardware();
      }
    });
  } catch (error) {
    if (usbConnection === connection) {
      usbConnection = null;
      await connection.disconnect();
      update({
        status: "error",
        method: null,
        deviceId: null,
        error:
          error?.name === "NotFoundError"
            ? "No USB serial port selected."
            : (error?.message ?? "USB connection failed."),
      });
    }
    throw error;
  }
}

// The Railway relay requires browser authentication BEFORE a pairing request.
// RELAY_ALLOW_PAIR_CODE_BROWSER_AUTH=true enables this supervised prototype flow.
// Never put the ESP32 device token in browser code or Vite environment variables.
export function connectHardware({ endpoint, sessionId, pairingCode }) {
  if (typeof endpoint !== "string" || !endpoint.trim().startsWith("wss://")) {
    throw new Error("A secure wss:// relay endpoint is required.");
  }
  if (
    typeof sessionId !== "string" ||
    !sessionId.trim() ||
    typeof pairingCode !== "string" ||
    !pairingCode.trim()
  ) {
    throw new Error("Session ID and pairing code are required.");
  }

  const pairedSession = sessionId.trim();
  const suppliedPairingCode = pairingCode.trim();

  if (getTrainexSnapshot().sessionId !== pairedSession) {
    throw new Error("Pairing must target the current simulation session.");
  }

  disconnectHardware();
  const ws = new WebSocket(endpoint.trim());
  socket = ws;
  let authenticated = false;
  let paired = false;

  update({ status: "connecting", method: "websocket", error: null });

  function fail(message) {
    if (socket !== ws) return;
    update({
      status: "error",
      error: String(message || "Relay connection failed."),
    });
    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.close();
    }
  }

  ws.onopen = () => {
    if (socket !== ws) return;
    // Required first message: do NOT send 'pair' yet.
    ws.send(JSON.stringify({ type: "auth", role: "browser" }));

    // Keep authenticated browser connection active while awaiting inputs.
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket === ws && authenticated && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "heartbeat" }));
      }
    }, 20000);
  };

  ws.onmessage = (event) => {
    if (socket !== ws) return;
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      fail("Received malformed relay data.");
      return;
    }
    if (!message || typeof message !== "object") return;

    if (message.type === "authenticated") {
      if (authenticated) return;
      authenticated = true;
      // Correct second message: pair ONLY after relay authentication.
      ws.send(
        JSON.stringify({
          type: "pair",
          sessionId: pairedSession,
          pairingCode: suppliedPairingCode,
        }),
      );
      return;
    }

    if (message.type === "paired") {
      if (message.sessionId !== pairedSession) {
        fail("Relay paired a different session.");
        return;
      }
      if (typeof message.deviceId !== "string" || !message.deviceId.trim()) {
        fail("Relay did not provide a valid paired device ID.");
        return;
      }
      paired = true;
      sequence = -1;
      update({
        status: "connected",
        deviceId: message.deviceId,
        error: null,
        method: "websocket",
      });
      // The ESP32 receives vigilance warning feedback for its optional buzzer.
      const sendFeedback = () => {
        if (socket !== ws || ws.readyState !== WebSocket.OPEN || !paired)
          return;
        const state = getTrainexSnapshot().trainState;
        const buzzer =
          getTrainexSnapshot().ready && state?.vigilanceBuzzer === true;
        const now = Date.now();
        if (previousBuzzer === buzzer && now - lastFeedbackAt < 200) return;
        previousBuzzer = buzzer;
        lastFeedbackAt = now;
        ws.send(
          JSON.stringify({
            type: "state_feedback",
            sessionId: pairedSession,
            vigilanceBuzzer: buzzer,
            emergencyBrake: state?.emergencyBrake === true,
            speed: Number.isFinite(state?.speed) ? state.speed : 0,
          }),
        );
      };
      stopFeedback();
      unsubscribeFeedback = subscribeTrainex(sendFeedback);
      sendFeedback();
      return;
    }

    if (message.type === "error" || message.type === "pair-error") {
      fail(
        message.reason ||
          message.message ||
          "Relay rejected the connection or pairing.",
      );
      return;
    }

    if (message.type === "unpaired") {
      fail("The relay unpaired this simulation session.");
      return;
    }

    if (message.type !== "input" || !paired || hardware.status !== "connected")
      return;

    if (getTrainexSnapshot().sessionId !== pairedSession) {
      fail("Simulation session changed. Hardware disconnected.");
      return;
    }
    if (
      message.sessionId !== pairedSession ||
      message.deviceId !== hardware.deviceId
    )
      return;
    if (
      !Number.isSafeInteger(message.sequence) ||
      message.sequence < 0 ||
      message.sequence <= sequence
    )
      return;

    sequence = message.sequence;
    update({
      lastMessage: String(message.controlId ?? message.control ?? "—"),
    });

    Promise.resolve()
      .then(() => forwardHardwareInput(message))
      .then((result) => {
        if (socket === ws && result?.accepted !== true) {
          update({ error: result?.reason ?? "Hardware command was rejected." });
        }
      })
      .catch((error) => {
        if (socket === ws)
          update({ error: error?.message ?? "Hardware input failed." });
      });
  };

  ws.onerror = () => {
    if (socket === ws)
      update({ status: "error", error: "WebSocket connection failed." });
  };

  ws.onclose = (event) => {
    if (socket !== ws) return;
    stopHeartbeat();
    stopFeedback();
    socket = null;
    sequence = -1;
    // Retain the reason so the UI can show why pairing failed.
    const error =
      hardware.error ||
      (event.code === 1000
        ? null
        : `WebSocket closed (code ${event.code}${event.reason ? `: ${event.reason}` : ""}).`);
    update({
      status: "disconnected",
      deviceId: null,
      method: null,
      error,
    });
  };
}
