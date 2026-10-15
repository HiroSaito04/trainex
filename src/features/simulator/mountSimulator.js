
import { CircuitView } from "../../circuit/CircuitView.js";
import { BuzzerAudio } from "../../services/BuzzerAudio.js";

const NOTCHES = [
  "B3", "B2", "B1", "N",
  "P1", "P2", "P3", "P4",
];

const BUTTON_IDS = [
  "btn_eb",
  "btn_rst",
  "btn_open",
  "btn_close",
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseLcd(text = "") {
  const rows = Array.from({ length: 4 }, (_, index) =>
    text.slice(index * 20, index * 20 + 20).trim()
  );

  const speed = rows[0].match(/SPD:\s*(\d+)/i);
  const mode = rows[1].match(/MODE:\s*(\S+)/i);
  const doors = rows[2].match(/DOORS:\s*(\S+)/i);
  const emergency = rows[3].match(/EB:\s*(ON|OFF)/i);

  return {
    speed: speed ? Number(speed[1]) : 0,
    mode: mode?.[1] ?? "WAITING",
    doors: doors?.[1] ?? "WAITING",
    emergency: emergency?.[1] ?? "OFF",
  };
}

export function mountSimulator(root) {
  const $ = selector => {
    const element = root.querySelector(selector);

    if (!element) {
      throw new Error(
        `Missing simulator element: ${selector}`
      );
    }

    return element;
  };

  const ui = {
    status: $("#status"),
    reset: $("#resetButton"),
    mute: $("#muteButton"),
    fullscreen: $("#fullscreenButton"),
    viewport: $("#circuitViewport"),

    handle: $("#handleInput"),
    notch: $("#notchDisplay"),
    handleNotch: $("#handleNotch"),

    speed: $("#speedValue"),
    speedFill: $("#speedFill"),
    mode: $("#modeStatus"),
    doors: $("#doorStatus"),
    emergency: $("#emergencyStatus"),

    lamp: $("#doorLamp"),
    lampText: $("#lampStatus"),
  };

  const circuit = new CircuitView($("#circuit"));
  const audio = new BuzzerAudio();

  const worker = new Worker(
    new URL(
      "../../emulator/emulator.worker.js",
      import.meta.url
    ),
    { type: "module" }
  );

  const abortController = new AbortController();
  const { signal } = abortController;

  const buttonTimers = new Set();

  let disposed = false;
  let audioEnabled = true;
  let latestSnapshot = null;

  function send(type, payload = {}) {
    if (disposed) return;

    worker.postMessage({
      type,
      ...payload,
    });
  }

  function setStatus(message, state = "loading") {
    ui.status.textContent = message;
    ui.status.dataset.state = state;
  }

  function setHandle(value) {
    const raw = clamp(
      Math.round(Number(value) || 0),
      0,
      1023
    );

    const notch = Math.min(
      7,
      Math.floor(raw / 128)
    );

    ui.handle.value = String(raw);
    ui.notch.textContent = NOTCHES[notch];
    ui.handleNotch.textContent = NOTCHES[notch];

    const pot = circuit.get("pot");

    if (pot && Number(pot.value) !== raw) {
      pot.value = raw;
    }

    send("potentiometer", { value: raw });
  }

  function setButton(id, pressed) {
    if (!BUTTON_IDS.includes(id)) return;

    if (pressed && audioEnabled) {
      void audio.unlock().catch(console.error);
    }

    send("button", {
      id,
      pressed,
    });
  }

  function renderState(snapshot) {
    latestSnapshot = snapshot;

    const lcd = circuit.get("lcd");
    const led = circuit.get("led1");
    const buzzer = circuit.get("bz");

    if (lcd) {
      lcd.text = snapshot.lcdText ?? "";
      lcd.backlight = Boolean(snapshot.lcdBacklight);
    }

    if (led) {
      led.value = Boolean(snapshot.lamp);
    }

    const frequency = snapshot.buzzerFrequency || 0;

    if (buzzer) {
      buzzer.hasSignal = frequency > 0;
    }

    if (audioEnabled) {
      audio.setFrequency(frequency);
    } else {
      audio.stop();
    }

    const state = parseLcd(snapshot.lcdText);

    ui.speed.textContent = String(state.speed);

    ui.speedFill.style.width =
      `${clamp((state.speed / 80) * 100, 0, 100)}%`;

    ui.mode.textContent = state.mode;
    ui.doors.textContent = state.doors;

    const emergencyActive = state.emergency === "ON";

    ui.emergency.textContent = emergencyActive
      ? "ACTIVE"
      : "OFF";

    ui.emergency.dataset.active =
      String(emergencyActive);

    ui.lamp.dataset.active = String(Boolean(snapshot.lamp));

    ui.lampText.textContent = snapshot.lamp
      ? "Doors secured"
      : "Doors not secured";
  }

  function onWorkerMessage({ data }) {
    if (disposed) return;

    switch (data.type) {
      case "ready":
        setStatus("SYSTEM ONLINE", "running");
        break;

      case "state":
        renderState(data);
        break;

      case "error":
        setStatus("SIMULATION ERROR", "error");
        audio.stop();
        console.error("TRAINEX:", data.message);
        break;

      case "stopped":
        setStatus("SYSTEM STOPPED");
        audio.stop();
        break;
    }
  }

  worker.addEventListener(
    "message",
    onWorkerMessage,
    { signal }
  );

  worker.addEventListener(
    "error",
    event => {
      setStatus("EMULATOR ERROR", "error");
      audio.stop();
      console.error(event);
    },
    { signal }
  );

  function toggleMute() {
    audioEnabled = !audioEnabled;

    ui.mute.textContent = audioEnabled
      ? "♪ Sound On"
      : "♪ Sound Off";

    ui.mute.setAttribute(
      "aria-pressed",
      String(!audioEnabled)
    );

    if (!audioEnabled) {
      audio.stop();
      return;
    }

    void audio.unlock()
      .then(() => {
        if (!disposed && latestSnapshot) {
          audio.setFrequency(
            latestSnapshot.buzzerFrequency || 0
          );
        }
      })
      .catch(console.error);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === ui.viewport) {
        await document.exitFullscreen();
      } else {
        await ui.viewport.requestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen unavailable:", error);
    }
  }

  function updateFullscreenButton() {
    ui.fullscreen.textContent =
      document.fullscreenElement === ui.viewport
        ? "⛶ Exit Fullscreen"
        : "⛶ Fullscreen";
  }

  function connectButtons() {
    // Buttons belonging to the Wokwi-style circuit.
    for (const id of BUTTON_IDS) {
      const button = circuit.get(id);

      if (!button) continue;

      button.addEventListener(
        "button-press",
        () => setButton(id, true),
        { signal }
      );

      button.addEventListener(
        "button-release",
        () => setButton(id, false),
        { signal }
      );
    }

    // Accessible HTML buttons.
    root.querySelectorAll("[data-button]").forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const id = button.dataset.button;

          setButton(id, true);

          // Hold long enough for Arduino's debounce.
          const timer = window.setTimeout(() => {
            buttonTimers.delete(timer);
            setButton(id, false);
          }, 150);

          buttonTimers.add(timer);
        },
        { signal }
      );
    });
  }

  async function initialize() {
    setStatus("LOADING CIRCUIT");

    await circuit.mount();

    if (disposed) return;

    const pot = circuit.get("pot");

    if (pot) {
      pot.min = 0;
      pot.max = 1023;
      pot.step = 1;
      pot.value = 448;

      pot.addEventListener(
        "input",
        () => setHandle(pot.value),
        { signal }
      );
    }

    connectButtons();

    ui.handle.addEventListener(
      "input",
      event => {
        if (audioEnabled) {
          void audio.unlock().catch(console.error);
        }

        setHandle(event.target.value);
      },
      { signal }
    );

    ui.reset.addEventListener(
      "click",
      () => {
        audio.stop();
        setHandle(448);
        send("reset");
        setStatus("RESTARTING");
      },
      { signal }
    );

    ui.mute.addEventListener(
      "click",
      toggleMute,
      { signal }
    );

    ui.fullscreen.addEventListener(
      "click",
      toggleFullscreen,
      { signal }
    );

    document.addEventListener(
      "fullscreenchange",
      updateFullscreenButton,
      { signal }
    );

    setHandle(448);

    setStatus("LOADING FIRMWARE");

    send("start", {
      url: `${import.meta.env.BASE_URL}firmware/trainex.hex`,
    });
  }

  initialize().catch(error => {
    if (disposed) return;

    setStatus("INITIALIZATION FAILED", "error");
    console.error("TRAINEX:", error);
  });

  // Called automatically when the router unmounts the page.
  return function disposeSimulator() {
    if (disposed) return;

    disposed = true;
    abortController.abort();

    for (const timer of buttonTimers) {
      clearTimeout(timer);
    }

    buttonTimers.clear();

    worker.terminate();
    void audio.dispose();

    if (document.fullscreenElement === ui.viewport) {
      void document.exitFullscreen().catch(() => {});
    }
  };
}
