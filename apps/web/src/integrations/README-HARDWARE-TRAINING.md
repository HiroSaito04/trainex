# TRAINEX app integration guide

Your web app already uses `apps/web/src/integrations/trainexClient.js`. Keep it as the central session/input API. New modules are optional and **do not replace** existing 2D, 3D or TRAINEX engine files.

```js
import {createHardwareTrainingBridge} from './createHardwareTrainingBridge.js';
import {getTrainexSnapshot,subscribeTrainex,sendTrainexInput} from './trainexClient.js';
export const bridge=createHardwareTrainingBridge({
  getSnapshot:getTrainexSnapshot,
  subscribeSnapshot:subscribeTrainex,
  sendTrainexInput
});
```

Construct `bridge` once in a shared runtime module. Pass it to `<HardwareConnectionPanel bridge={bridge}/>` and `<TrainingScenarioPanel bridge={bridge}/>` on your current pages/routes. This avoids inventing `HardwarePage` or `TrainingPage` file names.

Hardware commands flow `ESP32 -> WSS relay/Web Serial -> HardwareClient -> sendTrainexInput -> InputManager -> TrainSimulationEngine -> state feedback`. The `HardwareClient` does **not** host a separate engine.

If you want training scenarios to also evaluate 2D/3D UI actions, route those UI commands through `bridge.submitInput(event)` instead of calling `sendTrainexInput` directly; state-only steps already advance via the engine subscription. You must avoid double-recording an event from both paths.

The app must obtain browser relay access tokens from a trusted authenticated backend; **never** store secret bearer tokens in public Vite environment variables or checked-in code. The included relay provides a fixed-token demonstration, not a complete production identity provider.

Before enabling Wi-Fi pairing, verify the relay is separately hosted as a long-running service. Vercel is the website host, not the WSS relay.
