import { sendTrainexInput } from "./trainexClient.js";

// All website-originating operating commands use the same input manager.
export function sendInput(event) {
  return sendTrainexInput(event);
}

export const dispatchInput = sendInput;
export const dispatchTrainexInput = sendInput;

// Translate the relay's hardware message into the input-manager contract.
// The relay must authenticate pairing and device/session ownership.
export function forwardHardwareInput(message) {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return Promise.resolve({ accepted: false, reason: "Invalid hardware message." });
  }

  return sendTrainexInput({
    source: "hardware",
    sessionId: message.sessionId,
    deviceId: message.deviceId,
    sequence: message.sequence,
    controlId: message.controlId ?? message.control,
    value: message.value ?? null,
  });
}
