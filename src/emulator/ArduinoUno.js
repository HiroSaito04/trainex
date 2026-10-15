
import {
  CPU,
  avrInstruction,
  AVRIOPort,
  AVRTimer,
  AVRADC,
  AVRTWI,
  PinState,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  adcConfig,
  twiConfig,
} from "avr8js";

import { parseIntelHex } from "./intelHex.js";
import { I2CLcd } from "../peripherals/I2CLcd.js";

const CLOCK_HZ = 16_000_000;

const BUTTON_PINS = Object.freeze({
  btn_eb: 2,
  btn_rst: 3,
  btn_open: 4,
  btn_close: 5,
});

export class ArduinoUno {
  #lastRisingEdge = null;
  #lastBuzzerEdge = null;
  #frequency = 0;

  constructor(hex) {
    this.cpu = new CPU(parseIntelHex(hex));

    // ATmega328P hardware timers.
    this.timer0 = new AVRTimer(
      this.cpu, timer0Config
    );

    this.timer1 = new AVRTimer(
      this.cpu, timer1Config
    );

    this.timer2 = new AVRTimer(
      this.cpu, timer2Config
    );

    // GPIO ports.
    this.portB = new AVRIOPort(
      this.cpu, portBConfig
    );

    this.portC = new AVRIOPort(
      this.cpu, portCConfig
    );

    this.portD = new AVRIOPort(
      this.cpu, portDConfig
    );

    // Analog-to-digital converter.
    this.adc = new AVRADC(
      this.cpu, adcConfig
    );

    // I2C controller and LCD device.
    this.twi = new AVRTWI(
      this.cpu, twiConfig, CLOCK_HZ
    );

    this.lcd = new I2CLcd(this.twi, 0x27);

    // INPUT_PULLUP: unpressed buttons read HIGH.
    for (const pin of Object.values(BUTTON_PINS)) {
      this.portD.setPin(pin, true);
    }

    this.setPotentiometer(448);

    // Observe buzzer output on Arduino D7 / PD7.
    this.portD.addListener((value, previous) => {
      const mask = 1 << 7;

      if (!((value ^ previous) & mask)) return;

      this.#lastBuzzerEdge = this.cpu.cycles;

      if (value & mask) {
        if (this.#lastRisingEdge !== null) {
          const period =
            this.cpu.cycles - this.#lastRisingEdge;

          if (period > 0) {
            const frequency = CLOCK_HZ / period;

            if (frequency >= 100 && frequency <= 5000) {
              this.#frequency = frequency;
            }
          }
        }

        this.#lastRisingEdge = this.cpu.cycles;
      }
    });
  }

  setButton(id, pressed) {
    const pin = BUTTON_PINS[id];

    if (pin === undefined) {
      throw new Error(`Unknown button: ${id}`);
    }

    this.portD.setPin(pin, !pressed);
  }

  setPotentiometer(value) {
    const raw = Math.max(
      0,
      Math.min(1023, Math.round(Number(value) || 0))
    );

    // Analog pin A0 operates between 0 and 5 volts.
    this.adc.channelValues[0] = (raw / 1023) * 5;
  }

  runCycles(count) {
    const target = this.cpu.cycles + count;

    while (this.cpu.cycles < target) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
  }

  snapshot() {
    const cyclesSinceBuzzer =
      this.#lastBuzzerEdge === null
        ? Infinity
        : this.cpu.cycles - this.#lastBuzzerEdge;

    const frequency =
      cyclesSinceBuzzer < CLOCK_HZ * 0.08
        ? this.#frequency
        : 0;

    return {
      lcdText: this.lcd.text,
      lcdBacklight: this.lcd.backlight,

      // The green lamp is connected to D6 / PD6.
      lamp:
        this.portD.pinState(6) === PinState.High,

      buzzerFrequency: frequency,
      cycles: this.cpu.cycles,
    };
  }
}
