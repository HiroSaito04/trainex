
import {
  HANDLE_POSITIONS,
} from "../config/consoleLayout.js";

export function handleMasterKeyDown(
  event,
  currentPosition,
  requestPosition
) {
  const direction = {
    ArrowLeft: -1,
    ArrowDown: -1,
    ArrowRight: 1,
    ArrowUp: 1,
  }[event.key];

  if (direction === undefined) return;

  event.preventDefault();

  const current = HANDLE_POSITIONS.indexOf(
    currentPosition
  );

  const index = current === -1 ? 4 : current;

  const next = Math.max(
    0,
    Math.min(
      HANDLE_POSITIONS.length - 1,
      index + direction
    )
  );

  if (next !== index) {
    requestPosition(HANDLE_POSITIONS[next]);
  }
}
