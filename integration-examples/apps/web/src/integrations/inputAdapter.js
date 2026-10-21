// Centralized input entry. Do not call engine.sendCommand directly from UI.
import { sendTrainexInput } from './trainexClient.js';
export function sendInput(event) { return sendTrainexInput(event); }
export const dispatchInput = sendInput;
export const dispatchTrainexInput = sendInput;
