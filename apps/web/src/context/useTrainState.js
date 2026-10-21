import {
  useSyncExternalStore,
} from "react";

import {
  getTrainexSnapshot,
  subscribeTrainex,
} from "../integrations/trainexClient.js";

export function useTrainState() {
  return useSyncExternalStore(
    subscribeTrainex,
    getTrainexSnapshot
  );
}
