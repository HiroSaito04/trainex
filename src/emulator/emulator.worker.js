
import { ArduinoUno } from "./ArduinoUno.js";

const CLOCK_HZ = 16_000_000;
const CYCLES_PER_CHUNK = 160_000;

let machine = null;
let firmware = null;
let running = false;
let timeoutId = null;
let startWallTime = 0;
let startCycles = 0;
let chunks = 0;

let currentPot = 448;

function send(type, payload = {}) {
  self.postMessage({ type, ...payload });
}

function publishState() {
  if (!machine) return;

  send("state", machine.snapshot());
}

function stop() {
  running = false;

  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function initialize() {
  if (!firmware) return;

  stop();

  machine = new ArduinoUno(firmware);
  machine.setPotentiometer(currentPot);

  running = true;
  chunks = 0;

  startWallTime = performance.now();
  startCycles = machine.cpu.cycles;

  send("ready");
  publishState();

  executeChunk();
}

function executeChunk() {
  if (!running || !machine) return;

  try {
    machine.runCycles(CYCLES_PER_CHUNK);
    chunks++;

    // Publish approximately 25 updates per simulated second.
    if (chunks % 4 === 0) {
      publishState();
    }

    const simulatedMilliseconds =
      ((machine.cpu.cycles - startCycles) / CLOCK_HZ) * 1000;

    const wallMilliseconds =
      performance.now() - startWallTime;

    const delay = Math.max(
      0,
      Math.min(
        20,
        simulatedMilliseconds - wallMilliseconds
      )
    );

    timeoutId = setTimeout(executeChunk, delay);
  } catch (error) {
    stop();

    send("error", {
      message: error.message,
    });
  }
}

self.addEventListener("message", async ({ data }) => {
  try {
    switch (data.type) {
      case "start": {
        if (running) break;

        const response = await fetch(data.url);

        if (!response.ok) {
          throw new Error(
            `Cannot load firmware: HTTP ${response.status}`
          );
        }

        firmware = await response.text();
        initialize();
        break;
      }

      case "potentiometer": {
        currentPot = data.value;
        machine?.setPotentiometer(currentPot);
        break;
      }

      case "button": {
        machine?.setButton(
          data.id,
          Boolean(data.pressed)
        );
        break;
      }

      case "reset": {
        initialize();
        break;
      }

      case "stop": {
        stop();
        send("stopped");
        break;
      }
    }
  } catch (error) {
    stop();

    send("error", {
      message: error.message,
    });
  }
});
