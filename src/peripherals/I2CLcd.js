
const ROW_ADDRESSES = [
  0x00, 0x40, 0x14, 0x54
];

export class I2CLcd {
  #memory = new Uint8Array(128).fill(32);
  #cursor = 0;
  #fourBitMode = false;
  #highNibble = null;
  #previousValue = 0;
  #selected = false;
  #displayOn = true;
  #backlight = true;

  constructor(twi, address = 0x27) {
    this.address = address;

    twi.eventHandler = {
      start: () => {
        twi.completeStart();
      },

      stop: () => {
        this.#selected = false;
        twi.completeStop();
      },

      connectToSlave: (addr, write) => {
        this.#selected = addr === address && write;
        twi.completeConnect(this.#selected);
      },

      writeByte: value => {
        if (this.#selected) {
          this.#writeExpander(value);
        }

        twi.completeWrite(this.#selected);
      },

      readByte: () => {
        twi.completeRead(0xff);
      },
    };
  }

  get backlight() {
    return this.#backlight;
  }

  get text() {
    if (!this.#displayOn) {
      return " ".repeat(80);
    }

    return ROW_ADDRESSES.map(start => {
      let row = "";

      for (let i = 0; i < 20; i++) {
        row += String.fromCharCode(
          this.#memory[(start + i) & 0x7f]
        );
      }

      return row;
    }).join("");
  }

  #writeExpander(value) {
    // PCF8574 common backpack mapping:
    // P7-P4: data, P3: backlight,
    // P2: enable, P1: RW, P0: RS.

    this.#backlight = Boolean(value & 0x08);

    const previousEnable =
      Boolean(this.#previousValue & 0x04);

    const currentEnable = Boolean(value & 0x04);

    this.#previousValue = value;

    // Capture data on falling edge of LCD enable.
    if (previousEnable && !currentEnable) {
      const nibble = (value >> 4) & 0x0f;
      const isData = Boolean(value & 0x01);
      const isRead = Boolean(value & 0x02);

      if (!isRead) {
        this.#receiveNibble(nibble, isData);
      }
    }
  }

  #receiveNibble(nibble, isData) {
    if (!this.#fourBitMode) {
      if (nibble === 0x02) {
        this.#fourBitMode = true;
      }
      return;
    }

    if (this.#highNibble === null) {
      this.#highNibble = {
        value: nibble,
        isData,
      };
      return;
    }

    const byte =
      (this.#highNibble.value << 4) | nibble;

    const dataMode = this.#highNibble.isData;

    this.#highNibble = null;

    if (dataMode) {
      this.#memory[this.#cursor] = byte;
      this.#cursor = (this.#cursor + 1) & 0x7f;
    } else {
      this.#command(byte);
    }
  }

  #command(value) {
    if (value === 0x01) {
      this.#memory.fill(32);
      this.#cursor = 0;
      return;
    }

    if (value === 0x02) {
      this.#cursor = 0;
      return;
    }

    if (value & 0x80) {
      this.#cursor = value & 0x7f;
      return;
    }

    if ((value & 0xf8) === 0x08) {
      this.#displayOn = Boolean(value & 0x04);
    }
  }
}
