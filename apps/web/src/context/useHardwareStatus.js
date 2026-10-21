import {
  useSyncExternalStore,
} from "react";

import {
  getHardwareSnapshot,
  subscribeHardware,
} from "../integrations/hardwareAdapter.js";

export function useHardwareStatus() {
  return useSyncExternalStore(
    subscribeHardware,
    getHardwareSnapshot
  );
}
