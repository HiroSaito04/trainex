/**
 * Browser USB serial reader for the classic ESP32's USB-to-UART COM port.
 * Permission is requested only inside connect(), which MUST be called directly
 * from a real button click (not an effect, timer, or page-load handler).
 * One COM port cannot be opened by both this reader and PlatformIO Monitor.
 */
export class UsbSerialConnection {
  constructor({
    serial = globalThis.navigator?.serial,
    baudRate = 115200,
    onLine,
    onClosed,
  }) {
    this.serial = serial;
    this.baudRate = baudRate;
    this.onLine = onLine;
    this.onClosed = onClosed;
    this.port = null;
    this.reader = null;
    this.readTask = null;
    this.closed = false;
    this.portCloseTask = null;
  }

  async connect() {
    if (!this.serial?.requestPort) {
      throw new Error(
        "USB Serial requires a compatible browser (Chrome/Edge) over HTTPS or localhost.",
      );
    }
    // IMPORTANT: requestPort() happens before the first await; preserve the click gesture.
    const port = await this.serial.requestPort();
    if (this.closed) return;
    this.port = port;
    await port.open({ baudRate: this.baudRate });
    if (this.closed) {
      await this.#closePort();
      return;
    }
    // Not awaited: keep processing events while the page is open.
    this.readTask = this.#readLoop();
  }

  async #readLoop() {
    let pending = "";
    const decoder = new TextDecoder();
    let readError = null;
    try {
      while (!this.closed && this.port?.readable) {
        const reader = this.port.readable.getReader();
        this.reader = reader;
        try {
          while (!this.closed) {
            const { value, done } = await reader.read();
            if (done) break;
            pending += decoder.decode(value, { stream: true });
            // Avoid unbounded input on corrupt serial bytes or newline-free output.
            if (pending.length > 16384 && !pending.includes("\n")) pending = "";
            let newline;
            while ((newline = pending.indexOf("\n")) !== -1) {
              const line = pending.slice(0, newline).replace(/\r$/, "");
              pending = pending.slice(newline + 1);
              if (line.length <= 4096 && !this.closed) this.onLine(line);
            }
          }
        } finally {
          if (this.reader === reader) this.reader = null;
          reader.releaseLock();
        }
        // Most ESP32 serial devices do not need recovery loops. A closed read
        // stream signals a disconnect, rather than retrying indefinitely.
        break;
      }
    } catch (error) {
      if (!this.closed) readError = error;
    } finally {
      const userClosed = this.closed;
      this.closed = true;
      await this.#closePort();
      if (!userClosed)
        this.onClosed(
          readError ?? new Error("ESP32 USB Serial connection ended."),
        );
    }
  }

  async #closePort() {
    if (!this.port) return;
    if (!this.portCloseTask) {
      const port = this.port;
      this.portCloseTask = (async () => {
        try {
          await port.close();
        } catch {
          /* Disconnect can close a port already removed. */
        }
        if (this.port === port) this.port = null;
      })();
    }
    await this.portCloseTask;
  }

  async disconnect() {
    this.closed = true;
    try {
      await this.reader?.cancel();
    } catch {
      /* USB may already be detached. */
    }
    if (this.readTask) await this.readTask;
    else await this.#closePort();
  }
}
